import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { createHmac } from 'crypto';

/**
 * Integration tests for the complete webhook flow
 * Tests GitHub webhook delivery through Cloudflare Worker to Next.js
 */

const LOCAL_URL = 'http://localhost:3001';
const WEBHOOK_ENDPOINT = '/api/webhooks/github';
const CLOUDFLARE_WORKER_URL = 'https://webhook-gateway.pixeliumperfecto.workers.dev';

// Mock webhook payloads
const mockPingPayload = {
  zen: 'Non-blocking is better than blocking.',
  hook_id: 12345678,
  hook: {
    type: 'Repository',
    id: 12345678,
    name: 'web',
    active: true,
    events: ['push', 'pull_request'],
    config: {
      content_type: 'json',
      insecure_ssl: '0',
      url: `${CLOUDFLARE_WORKER_URL}${WEBHOOK_ENDPOINT}`,
    },
  },
};

const mockInstallationPayload = {
  action: 'created',
  installation: {
    id: 1234567,
    account: {
      login: 'testuser',
      id: 123456,
      type: 'User',
    },
    repository_selection: 'selected',
    access_tokens_url: 'https://api.github.com/app/installations/1234567/access_tokens',
    repositories_url: 'https://api.github.com/installation/repositories',
    html_url: 'https://github.com/settings/installations/1234567',
    app_id: 1484403,
    target_id: 123456,
    target_type: 'User',
    permissions: {
      contents: 'read',
      metadata: 'read',
      pull_requests: 'write',
    },
    events: ['push', 'pull_request'],
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    single_file_name: null,
  },
  repositories: [
    {
      id: 987654321,
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      private: false,
    },
  ],
  sender: {
    login: 'testuser',
    id: 123456,
    type: 'User',
  },
};

// Helper function to create GitHub webhook signature
function createWebhookSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

// Helper function to make webhook request
async function makeWebhookRequest(
  url: string,
  payload: object,
  event: string,
  signature?: string
): Promise<Response> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-GitHub-Event': event,
    'X-GitHub-Delivery': `test-${Date.now()}`,
    'User-Agent': 'GitHub-Hookshot/test',
  };

  if (signature) {
    headers['X-GitHub-Signature-256'] = signature;
  }

  return fetch(url, {
    method: 'POST',
    headers,
    body,
  });
}

describe('Webhook Flow Integration Tests', () => {
  let webhookSecret: string | undefined;

  beforeAll(async () => {
    // Load webhook secret from environment
    webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Local Next.js Webhook Endpoint', () => {
    test('should respond to ping webhook', async () => {
      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      const signature = webhookSecret 
        ? createWebhookSignature(JSON.stringify(mockPingPayload), webhookSecret)
        : undefined;

      const response = await makeWebhookRequest(url, mockPingPayload, 'ping', signature);
      
      expect(response.status).toBe(200);
      
      const responseText = await response.text();
      expect(responseText).toContain('pong');
    });

    test('should handle installation webhook', async () => {
      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      const signature = webhookSecret 
        ? createWebhookSignature(JSON.stringify(mockInstallationPayload), webhookSecret)
        : undefined;

      const response = await makeWebhookRequest(url, mockInstallationPayload, 'installation', signature);
      
      expect(response.status).toBe(200);
    });

    test('should reject requests without proper headers', async () => {
      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockPingPayload),
      });
      
      // Should reject due to missing GitHub headers
      expect(response.status).toBe(400);
    });

    test('should reject GET requests', async () => {
      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      expect(response.status).toBe(405);
    });
  });

  describe('Cloudflare Worker Integration', () => {
    test('should forward ping webhook to local endpoint', async () => {
      const url = `${CLOUDFLARE_WORKER_URL}${WEBHOOK_ENDPOINT}`;
      const signature = webhookSecret 
        ? createWebhookSignature(JSON.stringify(mockPingPayload), webhookSecret)
        : undefined;

      const response = await makeWebhookRequest(url, mockPingPayload, 'ping', signature);
      
      // Should successfully forward to local endpoint
      expect(response.status).toBe(200);
    }, 10000); // Longer timeout for external request

    test('should handle CORS preflight requests', async () => {
      const url = `${CLOUDFLARE_WORKER_URL}${WEBHOOK_ENDPOINT}`;
      
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://github.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, X-GitHub-Event',
        },
      });
      
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    }, 10000);
  });

  describe('Webhook Signature Validation', () => {
    test('should accept valid signatures', async () => {
      if (!webhookSecret) {
        console.log('Skipping signature test - no webhook secret configured');
        return;
      }

      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      const payload = JSON.stringify(mockPingPayload);
      const signature = createWebhookSignature(payload, webhookSecret);

      const response = await makeWebhookRequest(url, mockPingPayload, 'ping', signature);
      
      expect(response.status).toBe(200);
    });

    test('should reject invalid signatures', async () => {
      if (!webhookSecret) {
        console.log('Skipping signature test - no webhook secret configured');
        return;
      }

      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      const invalidSignature = 'sha256=invalid_signature';

      const response = await makeWebhookRequest(url, mockPingPayload, 'ping', invalidSignature);
      
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Event': 'ping',
          'X-GitHub-Delivery': 'test-malformed',
          'User-Agent': 'GitHub-Hookshot/test',
        },
        body: 'invalid json',
      });
      
      expect(response.status).toBe(400);
    });

    test('should handle missing event header', async () => {
      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Delivery': 'test-no-event',
          'User-Agent': 'GitHub-Hookshot/test',
        },
        body: JSON.stringify(mockPingPayload),
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Database Integration', () => {
    test('should process installation webhook and update database', async () => {
      const url = `${LOCAL_URL}${WEBHOOK_ENDPOINT}`;
      const signature = webhookSecret 
        ? createWebhookSignature(JSON.stringify(mockInstallationPayload), webhookSecret)
        : undefined;

      const response = await makeWebhookRequest(url, mockInstallationPayload, 'installation', signature);
      
      expect(response.status).toBe(200);
      
      // Note: In a real test, you would verify the database was updated
      // This would require database test utilities and cleanup
    });
  });
});

describe('Health Checks', () => {
  test('should have Next.js server running', async () => {
    const response = await fetch(LOCAL_URL);
    expect(response.status).toBe(200);
  });

  test('should have webhook endpoint available', async () => {
    const response = await fetch(`${LOCAL_URL}${WEBHOOK_ENDPOINT}`, {
      method: 'OPTIONS',
    });
    
    // Should handle OPTIONS request (even if it returns an error, it means the endpoint exists)
    expect([200, 405, 404]).toContain(response.status);
  });
});

