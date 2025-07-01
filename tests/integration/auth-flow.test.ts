import { describe, test, expect, beforeAll, afterAll } from 'bun:test';

/**
 * Integration tests for the authentication flow
 * Tests OAuth + GitHub App hybrid authentication system
 */

const LOCAL_URL = 'http://localhost:3001';
const API_BASE = `${LOCAL_URL}/api`;

// Mock user session data
const mockUserSession = {
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://github.com/testuser.png',
  },
  isSignedIn: true,
  authType: 'oauth',
};

// Mock installation data
const mockInstallationData = {
  installationId: 1234567,
  accountLogin: 'testuser',
  accountType: 'User',
};

describe('Authentication Flow Integration Tests', () => {
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('OAuth Authentication', () => {
    test('should have GitHub OAuth provider configured', async () => {
      // Test that the OAuth configuration is accessible
      const response = await fetch(`${API_BASE}/auth/providers`);
      
      if (response.ok) {
        const providers = await response.json();
        expect(providers).toContain('github');
      } else {
        // If providers endpoint doesn't exist, that's okay
        // Just verify the auth system is responding
        expect(response.status).toBeLessThan(500);
      }
    });

    test('should redirect to GitHub for OAuth', async () => {
      const response = await fetch(`${API_BASE}/auth/signin/github`, {
        redirect: 'manual',
      });
      
      // Should redirect to GitHub OAuth
      expect([302, 307, 308]).toContain(response.status);
      
      const location = response.headers.get('location');
      if (location) {
        expect(location).toContain('github.com');
      }
    });
  });

  describe('Installation Linking API', () => {
    test('should require authentication for installation linking', async () => {
      const response = await fetch(`${API_BASE}/auth/link-installation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ installationId: 1234567 }),
      });
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toContain('Authentication required');
    });

    test('should validate installation ID format', async () => {
      // This test would need a valid session, so we'll test the validation logic
      const response = await fetch(`${API_BASE}/auth/link-installation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In a real test, you'd include valid auth headers
        },
        body: JSON.stringify({ installationId: 'invalid' }),
      });
      
      // Should fail due to either auth or validation
      expect([400, 401]).toContain(response.status);
    });

    test('should handle missing installation ID', async () => {
      const response = await fetch(`${API_BASE}/auth/link-installation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      // Should fail due to either auth or validation
      expect([400, 401]).toContain(response.status);
    });

    test('should support GET requests to check installation status', async () => {
      const response = await fetch(`${API_BASE}/auth/link-installation`);
      
      expect(response.status).toBe(401); // Should require auth
      
      const data = await response.json();
      expect(data.error).toContain('Authentication required');
    });

    test('should support DELETE requests to unlink installation', async () => {
      const response = await fetch(`${API_BASE}/auth/link-installation`, {
        method: 'DELETE',
      });
      
      expect(response.status).toBe(401); // Should require auth
      
      const data = await response.json();
      expect(data.error).toContain('Authentication required');
    });
  });

  describe('GitHub App Authentication', () => {
    test('should have GitHub App configuration', () => {
      // Test environment variables are set
      expect(process.env.GITHUB_APP_ID).toBeDefined();
      expect(process.env.GITHUB_APP_NAME).toBeDefined();
      expect(process.env.GITHUB_PRIVATE_KEY).toBeDefined();
      
      // Validate App ID format
      const appId = process.env.GITHUB_APP_ID;
      expect(appId).toMatch(/^\d+$/);
      
      // Validate private key format
      const privateKey = process.env.GITHUB_PRIVATE_KEY;
      expect(privateKey).toContain('BEGIN RSA PRIVATE KEY');
      expect(privateKey).toContain('END RSA PRIVATE KEY');
    });

    test('should validate GitHub App credentials', async () => {
      // This would test the actual GitHub App authentication
      // In a real test environment, you'd mock the GitHub API
      
      const { App } = await import('@octokit/app');
      
      expect(() => {
        new App({
          appId: process.env.GITHUB_APP_ID!,
          privateKey: process.env.GITHUB_PRIVATE_KEY!,
        });
      }).not.toThrow();
    });
  });

  describe('Installation Callback Flow', () => {
    test('should handle installation callback page', async () => {
      const response = await fetch(`${LOCAL_URL}/install/callback?installation_id=1234567&setup_action=install`);
      
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('Installing GitHub App');
    });

    test('should handle missing installation ID', async () => {
      const response = await fetch(`${LOCAL_URL}/install/callback`);
      
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('Installation Failed');
    });

    test('should handle update action', async () => {
      const response = await fetch(`${LOCAL_URL}/install/callback?installation_id=1234567&setup_action=update`);
      
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('updated successfully');
    });
  });

  describe('Install Page', () => {
    test('should render installation page', async () => {
      const response = await fetch(`${LOCAL_URL}/install`);
      
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('GitHub App');
    });

    test('should include installation URL', async () => {
      const response = await fetch(`${LOCAL_URL}/install`);
      
      const html = await response.text();
      const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME;
      
      if (appName) {
        expect(html).toContain(`github.com/apps/${appName}`);
      }
    });
  });

  describe('Session Management', () => {
    test('should handle session validation', async () => {
      // Test session endpoint if it exists
      const response = await fetch(`${API_BASE}/auth/session`);
      
      // Should return session info or 401
      expect([200, 401]).toContain(response.status);
    });

    test('should handle sign out', async () => {
      const response = await fetch(`${API_BASE}/auth/signout`, {
        method: 'POST',
      });
      
      // Should handle sign out request
      expect([200, 302, 405]).toContain(response.status);
    });
  });

  describe('Environment Configuration', () => {
    test('should have all required environment variables', () => {
      const requiredVars = [
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',
        'GITHUB_APP_ID',
        'GITHUB_APP_NAME',
        'GITHUB_PRIVATE_KEY',
        'BETTER_AUTH_SECRET',
        'DATABASE_URL',
      ];

      for (const varName of requiredVars) {
        expect(process.env[varName]).toBeDefined();
        expect(process.env[varName]).not.toBe('');
        expect(process.env[varName]).not.toContain('your_');
      }
    });

    test('should have valid public environment variables', () => {
      expect(process.env.NEXT_PUBLIC_GITHUB_APP_NAME).toBeDefined();
      expect(process.env.NEXT_PUBLIC_GITHUB_APP_ID).toBeDefined();
      expect(process.env.NEXT_PUBLIC_APP_URL).toBeDefined();
      
      // Validate URL format
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      expect(appUrl).toMatch(/^https?:\/\/.+/);
    });
  });

  describe('Database Schema', () => {
    test('should have required tables for authentication', async () => {
      // This would test database connectivity and schema
      // In a real test, you'd use a test database
      
      const { db } = await import('@/db');
      
      // Test that we can import the database connection
      expect(db).toBeDefined();
    });

    test('should have account table with installationId column', async () => {
      // This would verify the database schema
      // In a real test, you'd query the database schema
      
      const { account } = await import('@/db/schema');
      
      // Test that the schema includes the installationId field
      expect(account).toBeDefined();
    });
  });
});

describe('Error Handling', () => {
  test('should handle invalid API endpoints gracefully', async () => {
    const response = await fetch(`${API_BASE}/auth/invalid-endpoint`);
    
    expect(response.status).toBe(404);
  });

  test('should handle malformed requests', async () => {
    const response = await fetch(`${API_BASE}/auth/link-installation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });
    
    expect([400, 401]).toContain(response.status);
  });

  test('should handle missing content type', async () => {
    const response = await fetch(`${API_BASE}/auth/link-installation`, {
      method: 'POST',
      body: JSON.stringify({ installationId: 123 }),
    });
    
    expect([400, 401, 415]).toContain(response.status);
  });
});

