/**
 * Cloudflare Worker for GitHub Webhook Gateway
 * 
 * This worker receives GitHub webhooks and forwards them to the Next.js application.
 * It handles CORS, request validation, and provides a reliable webhook gateway.
 * 
 * Features:
 * - Webhook forwarding to local/production Next.js app
 * - CORS handling for cross-origin requests
 * - Request validation and error handling
 * - Signature preservation for security
 * - Logging and monitoring
 */

// Configuration
const CONFIG = {
  // Target URL for webhook forwarding (set via environment variable)
  TARGET_URL: typeof TARGET_URL !== 'undefined' ? TARGET_URL : 'http://localhost:3001',
  
  // Webhook endpoint path
  WEBHOOK_PATH: '/api/webhooks/github',
  
  // Timeout for forwarding requests (in milliseconds)
  TIMEOUT: 30000,
  
  // Maximum request body size (in bytes)
  MAX_BODY_SIZE: 1024 * 1024, // 1MB
  
  // CORS configuration
  CORS: {
    ALLOW_ORIGIN: '*',
    ALLOW_METHODS: 'GET, POST, OPTIONS',
    ALLOW_HEADERS: 'Content-Type, X-GitHub-Event, X-GitHub-Delivery, X-GitHub-Signature-256, User-Agent',
    MAX_AGE: 86400, // 24 hours
  },
};

/**
 * Main request handler
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Handle incoming requests
 */
async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    
    // Log incoming request
    console.log(`[${new Date().toISOString()}] ${method} ${url.pathname}`);
    
    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return handleCORS();
    }
    
    // Only handle webhook path
    if (url.pathname !== CONFIG.WEBHOOK_PATH) {
      return new Response('Not Found', { 
        status: 404,
        headers: getCORSHeaders(),
      });
    }
    
    // Only allow POST requests for webhooks
    if (method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: {
          ...getCORSHeaders(),
          'Allow': 'POST, OPTIONS',
        },
      });
    }
    
    // Forward webhook to target application
    return await forwardWebhook(request);
    
  } catch (error) {
    console.error('Error handling request:', error);
    
    return new Response('Internal Server Error', {
      status: 500,
      headers: getCORSHeaders(),
    });
  }
}

/**
 * Forward webhook to the target Next.js application
 */
async function forwardWebhook(request) {
  try {
    // Validate request
    const validation = await validateWebhookRequest(request);
    if (!validation.valid) {
      return new Response(validation.error, {
        status: validation.status,
        headers: getCORSHeaders(),
      });
    }
    
    // Clone request for forwarding
    const targetUrl = `${CONFIG.TARGET_URL}${CONFIG.WEBHOOK_PATH}`;
    
    // Create forwarding request with all original headers
    const forwardRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Add forwarding headers
    forwardRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || 'unknown');
    forwardRequest.headers.set('X-Forwarded-Proto', 'https');
    forwardRequest.headers.set('X-Forwarded-Host', new URL(request.url).host);
    forwardRequest.headers.set('X-Original-URL', request.url);
    
    console.log(`Forwarding webhook to: ${targetUrl}`);
    
    // Forward request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    
    const response = await fetch(forwardRequest, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Log response
    console.log(`Response from target: ${response.status} ${response.statusText}`);
    
    // Create response with CORS headers
    const responseBody = await response.text();
    
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...getCORSHeaders(),
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
      },
    });
    
  } catch (error) {
    console.error('Error forwarding webhook:', error);
    
    if (error.name === 'AbortError') {
      return new Response('Gateway Timeout', {
        status: 504,
        headers: getCORSHeaders(),
      });
    }
    
    return new Response('Bad Gateway', {
      status: 502,
      headers: getCORSHeaders(),
    });
  }
}

/**
 * Validate incoming webhook request
 */
async function validateWebhookRequest(request) {
  // Check Content-Type
  const contentType = request.headers.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    return {
      valid: false,
      status: 400,
      error: 'Invalid Content-Type. Expected application/json',
    };
  }
  
  // Check required GitHub headers
  const requiredHeaders = ['X-GitHub-Event', 'X-GitHub-Delivery'];
  for (const header of requiredHeaders) {
    if (!request.headers.get(header)) {
      return {
        valid: false,
        status: 400,
        error: `Missing required header: ${header}`,
      };
    }
  }
  
  // Check User-Agent
  const userAgent = request.headers.get('User-Agent');
  if (!userAgent || !userAgent.includes('GitHub-Hookshot')) {
    console.warn('Suspicious User-Agent:', userAgent);
    // Don't reject, but log for monitoring
  }
  
  // Check request body size
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength) > CONFIG.MAX_BODY_SIZE) {
    return {
      valid: false,
      status: 413,
      error: 'Request body too large',
    };
  }
  
  return { valid: true };
}

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(),
  });
}

/**
 * Get CORS headers
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': CONFIG.CORS.ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': CONFIG.CORS.ALLOW_METHODS,
    'Access-Control-Allow-Headers': CONFIG.CORS.ALLOW_HEADERS,
    'Access-Control-Max-Age': CONFIG.CORS.MAX_AGE.toString(),
    'Vary': 'Origin',
  };
}

/**
 * Health check endpoint (for monitoring)
 */
async function handleHealthCheck() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    target: CONFIG.TARGET_URL,
    uptime: Date.now(),
  };
  
  return new Response(JSON.stringify(health), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(),
    },
  });
}

/**
 * Enhanced request handler with health check
 */
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Health check endpoint
  if (url.pathname === '/health') {
    event.respondWith(handleHealthCheck());
    return;
  }
  
  // Main webhook handler
  event.respondWith(handleRequest(event.request));
});

// Export for testing (if in a module environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleRequest,
    forwardWebhook,
    validateWebhookRequest,
    handleCORS,
    getCORSHeaders,
  };
}

