/**
 * GitHub Webhook Gateway for github.gg
 * Routes GitHub webhooks to local development or production environment
 */

// Configuration - these will be set as environment variables in Cloudflare
const CONFIG = {
  // Local development URL (when developing locally)
  LOCAL_URL: 'http://localhost:3001',
  // Production URL (when deployed)
  PRODUCTION_URL: 'https://github.gg',
  // Webhook secret for signature verification
  WEBHOOK_SECRET: 'GITHUB_WEBHOOK_SECRET', // This will be replaced with actual secret
};

/**
 * Verify GitHub webhook signature
 */
async function verifySignature(request, body, secret) {
  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHex = 'sha256=' + Array.from(new Uint8Array(expectedSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedHex;
}

/**
 * Forward webhook to target URL
 */
async function forwardWebhook(request, targetUrl, body) {
  const url = new URL('/api/webhooks/github', targetUrl);
  
  // Copy relevant headers
  const headers = new Headers();
  const relevantHeaders = [
    'content-type',
    'x-github-delivery',
    'x-github-event',
    'x-github-hook-id',
    'x-github-hook-installation-target-id',
    'x-github-hook-installation-target-type',
    'x-hub-signature-256',
    'user-agent'
  ];

  relevantHeaders.forEach(header => {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: headers,
      body: body,
      // Add timeout for local development (may be slow)
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: url.toString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: url.toString()
    };
  }
}

/**
 * Main request handler
 */
async function handleRequest(request, env) {
  // Only handle POST requests to webhook endpoint
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Check if this is a GitHub webhook
  const githubEvent = request.headers.get('x-github-event');
  if (!githubEvent) {
    return new Response('Not a GitHub webhook', { status: 400 });
  }

  try {
    // Read the request body
    const body = await request.text();
    
    // Verify webhook signature if secret is configured
    const webhookSecret = env.GITHUB_WEBHOOK_SECRET || CONFIG.WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret !== 'GITHUB_WEBHOOK_SECRET') {
      const isValid = await verifySignature(request, body, webhookSecret);
      if (!isValid) {
        console.log('Invalid webhook signature');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    // Determine target URL based on environment
    // For development, try local first, then fallback to production
    const isDevelopment = env.ENVIRONMENT === 'development' || !env.PRODUCTION_URL;
    const targets = isDevelopment 
      ? [env.LOCAL_URL || CONFIG.LOCAL_URL, env.PRODUCTION_URL || CONFIG.PRODUCTION_URL]
      : [env.PRODUCTION_URL || CONFIG.PRODUCTION_URL];

    let lastResult = null;
    
    // Try each target URL
    for (const targetUrl of targets) {
      if (!targetUrl) continue;
      
      console.log(`Forwarding ${githubEvent} webhook to ${targetUrl}`);
      const result = await forwardWebhook(request, targetUrl, body);
      lastResult = result;
      
      if (result.success) {
        console.log(`Successfully forwarded to ${result.url}`);
        return new Response(JSON.stringify({
          success: true,
          event: githubEvent,
          target: result.url,
          status: result.status
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        console.log(`Failed to forward to ${result.url}: ${result.error || result.statusText}`);
      }
    }

    // If all targets failed
    console.error('All webhook targets failed');
    return new Response(JSON.stringify({
      success: false,
      event: githubEvent,
      error: 'All targets failed',
      lastResult: lastResult
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Health check endpoint
 */
async function handleHealthCheck() {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'github-webhook-gateway'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Cloudflare Worker fetch event handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return handleHealthCheck();
    }
    
    // Main webhook handler
    if (url.pathname === '/api/webhooks/github' || url.pathname === '/') {
      return handleRequest(request, env);
    }
    
    // 404 for other paths
    return new Response('Not found', { status: 404 });
  }
};

