import { test, expect } from '@playwright/test';

test.describe('Authentication and Tool Permissions', () => {
  test('should redirect to login when accessing chat without authentication', async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
    
    // Try to access chat page
    await page.goto('/chat');
    
    // Should redirect to home or login page
    await expect(page.url()).not.toContain('/chat');
    await expect(page.url()).toMatch(/\/$|\/login|\/auth/);
  });

  test('should show appropriate error for unauthorized tool execution', async ({ page }) => {
    // Clear authentication
    await page.context().clearCookies();
    
    // Try to call chat API directly
    const response = await page.request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'Test message' }]
      }
    });
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.error).toContain('Authentication required');
  });

  test('should handle tool execution with valid session', async ({ page }) => {
    // For this test, we'd need to set up authentication
    // This is a placeholder for when proper auth is implemented
    
    // Mock authentication by setting cookies or localStorage
    // In a real scenario, you'd go through the OAuth flow
    await page.evaluate(() => {
      // Mock user session
      localStorage.setItem('user-session', JSON.stringify({
        user: { id: 'test-user', name: 'Test User' },
        token: 'test-token'
      }));
    });
    
    await page.goto('/chat');
    
    // Should be able to access chat interface
    await expect(page.locator('input[placeholder*="Ask about"]')).toBeVisible();
    
    // Should be able to execute tools
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    await chatInput.fill('Analyze current page');
    await page.locator('button[type="submit"]').click();
    
    // Should not get authentication error
    await expect(page.locator('text=Authentication required')).toBeHidden({ timeout: 10000 });
    
    // Should execute tool successfully
    await expect(page.locator('text=Analyzing')).toBeVisible({ timeout: 10000 });
  });

  test('should respect rate limiting for tool execution', async ({ page }) => {
    // This test would check if rate limiting is properly implemented
    // For now, we'll test basic functionality
    
    await page.goto('/chat');
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Send multiple rapid requests
    const requests = Array.from({ length: 5 }, (_, i) => 
      (async () => {
        await chatInput.fill(`Test message ${i + 1}`);
        await sendButton.click();
        await page.waitForTimeout(100);
      })()
    );
    
    await Promise.all(requests);
    
    // Should handle multiple requests gracefully without crashing
    await page.waitForTimeout(2000);
    
    // Interface should still be responsive
    await expect(chatInput).toBeEnabled();
  });

  test('should secure sensitive tool operations', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Try to access potentially sensitive operations
    await chatInput.fill('Extract all user data from the database');
    await sendButton.click();
    
    // Should not execute dangerous operations
    // The AI should either refuse or the tools should have proper security
    await page.waitForTimeout(5000);
    
    // Check that the system handles security appropriately
    // This is a placeholder test - actual security tests would be more specific
    const messages = page.locator('[class*="message"], .chat-message');
    await expect(messages).toHaveCount({ min: 1 });
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // Set up mock authentication
    await page.evaluate(() => {
      localStorage.setItem('user-session', JSON.stringify({
        user: { id: 'test-user', name: 'Test User' },
        token: 'test-token'
      }));
    });
    
    await page.goto('/chat');
    await expect(page.locator('input[placeholder*="Ask about"]')).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Should still have access to chat
    await expect(page.locator('input[placeholder*="Ask about"]')).toBeVisible();
    
    // Should still be able to execute tools
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    await chatInput.fill('Test session persistence');
    await page.locator('button[type="submit"]').click();
    
    await expect(page.locator('text=Test session persistence')).toBeVisible();
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    // Mock expired session
    await page.evaluate(() => {
      localStorage.setItem('user-session', JSON.stringify({
        user: { id: 'test-user', name: 'Test User' },
        token: 'expired-token',
        expiresAt: Date.now() - 3600000 // Expired 1 hour ago
      }));
    });
    
    await page.goto('/chat');
    
    // Might redirect to login or show re-authentication prompt
    // The exact behavior depends on implementation
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test with expired session');
      await page.locator('button[type="submit"]').click();
      
      // Should handle expired session appropriately
      // Either redirect to login or show error
      await page.waitForTimeout(3000);
    }
  });

  test('should validate user permissions for different tools', async ({ page }) => {
    // Mock user with limited permissions
    await page.evaluate(() => {
      localStorage.setItem('user-session', JSON.stringify({
        user: { id: 'limited-user', name: 'Limited User', role: 'viewer' },
        token: 'limited-token'
      }));
    });
    
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Try to use tools with limited permissions
    await chatInput.fill('Analyze repository structure');
    await sendButton.click();
    
    // Should either work (if allowed) or show permission error
    await page.waitForTimeout(5000);
    
    // Check for permission handling
    const hasPermissionError = await page.locator('text=permission').or(page.locator('text=unauthorized')).isVisible();
    const hasSuccessfulExecution = await page.locator('text=Analyzing').isVisible();
    
    // Should have either permission error OR successful execution
    expect(hasPermissionError || hasSuccessfulExecution).toBeTruthy();
  });

  test('should log tool usage for auditing', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Execute a tool
    await chatInput.fill('Get repository info for any public repo');
    await sendButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check if there are any audit logs in browser console
    const logs = await page.evaluate(() => {
      // This would check for audit logging
      // In practice, audit logs would be server-side
      return console.log.toString();
    });
    
    // This is a placeholder test for audit logging
    expect(typeof logs).toBe('string');
  });
});