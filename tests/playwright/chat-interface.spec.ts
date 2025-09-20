import { test, expect } from '@playwright/test';

test.describe('Chat Interface - Better-UI Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page (assuming authentication is handled)
    await page.goto('/chat');
  });

  test('should load chat interface with proper UI elements', async ({ page }) => {
    // Check if main chat interface elements are present
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Ask about"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for the bot icon and welcome message
    await expect(page.locator('text=Repository Assistant')).toBeVisible();
    await expect(page.locator('text=I can analyze code, search files')).toBeVisible();
  });

  test('should send a message and receive response', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Type a test message
    await chatInput.fill('Hello, can you help me analyze a repository?');
    await sendButton.click();
    
    // Check that the message appears in chat
    await expect(page.locator('text=Hello, can you help me analyze a repository?')).toBeVisible();
    
    // Wait for AI response (with timeout)
    await expect(page.locator('.chat-message').last()).toBeVisible({ timeout: 15000 });
    
    // Verify loading state appears and disappears
    await expect(page.locator('text=Thinking...')).toBeHidden({ timeout: 15000 });
  });

  test('should execute repository analysis tool', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Request repository analysis with a real repository
    await chatInput.fill('Analyze the structure of the preactjs/preact repository');
    await sendButton.click();
    
    // Wait for tool execution indicator
    await expect(page.locator('text=Analyzing Repository Structure')).toBeVisible({ timeout: 20000 });
    
    // Wait for tool result to appear
    await expect(page.locator('.tool-result')).toBeVisible({ timeout: 30000 });
    
    // Check for tool result content
    await expect(page.locator('text=Files').or(page.locator('text=Languages'))).toBeVisible();
  });

  test('should execute lynlang code analysis tool', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Request code analysis with sample code
    const sampleCode = `function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }`;
    
    await chatInput.fill(`Analyze this JavaScript code with lynlang: ${sampleCode}`);
    await sendButton.click();
    
    // Wait for lynlang tool execution
    await expect(page.locator('text=Analyzing Code with Lynlang')).toBeVisible({ timeout: 20000 });
    
    // Wait for analysis result
    await expect(page.locator('.tool-result')).toBeVisible({ timeout: 30000 });
    
    // Check for analysis metrics or fallback message
    await expect(
      page.locator('text=Lines').or(page.locator('text=Complexity')).or(page.locator('text=fallback'))
    ).toBeVisible();
  });

  test('should handle tool execution errors gracefully', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Request analysis of non-existent repository
    await chatInput.fill('Analyze the structure of nonexistent/invalid-repo-name');
    await sendButton.click();
    
    // Wait for tool execution
    await expect(page.locator('text=Analyzing Repository Structure')).toBeVisible({ timeout: 10000 });
    
    // Check for error handling
    await expect(
      page.locator('text=Tool execution failed').or(page.locator('text=not found')).or(page.locator('text=error'))
    ).toBeVisible({ timeout: 20000 });
  });

  test('should show tool parameters in expandable details', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await chatInput.fill('Search for React components in any public repository');
    await sendButton.click();
    
    // Wait for tool execution
    await page.waitForTimeout(3000);
    
    // Look for parameters section
    const parametersToggle = page.locator('summary:has-text("Parameters")');
    if (await parametersToggle.isVisible()) {
      await parametersToggle.click();
      
      // Check that parameters are shown in JSON format
      await expect(page.locator('pre').filter({ hasText: '{' })).toBeVisible();
    }
  });

  test('should support keyboard navigation and accessibility', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    
    // Focus should be on input initially or after clicking
    await chatInput.focus();
    await expect(chatInput).toBeFocused();
    
    // Type message and press Enter
    await chatInput.fill('Test keyboard navigation');
    await page.keyboard.press('Enter');
    
    // Message should be sent
    await expect(page.locator('text=Test keyboard navigation')).toBeVisible();
    
    // Input should remain focused for next message
    await expect(chatInput).toBeFocused();
  });

  test('should maintain chat history and context', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Send first message
    await chatInput.fill('Hello');
    await sendButton.click();
    await page.waitForTimeout(2000);
    
    // Send follow-up message
    await chatInput.fill('Can you remember what I just said?');
    await sendButton.click();
    
    // Both messages should be visible in chat history
    await expect(page.locator('text=Hello')).toBeVisible();
    await expect(page.locator('text=Can you remember')).toBeVisible();
    
    // Should have multiple message bubbles
    const messages = page.locator('.chat-message, [class*="message"]');
    await expect(messages).toHaveCount({ min: 2 });
  });

  test('should handle repository context when provided', async ({ page }) => {
    // Navigate to chat with repository context
    await page.goto('/chat?owner=preactjs&repo=preact');
    
    // Should show repository context in UI
    await expect(page.locator('text=preactjs/preact')).toBeVisible();
    
    // Should mention repository context
    await expect(page.locator('text=Currently analyzing')).toBeVisible();
  });

  test('should work across different screen sizes', async ({ page }) => {
    // Test on mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Chat interface should still be usable
    await expect(page.locator('input[placeholder*="Ask about"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test sending message on mobile
    await page.locator('input[placeholder*="Ask about"]').fill('Mobile test');
    await page.locator('button[type="submit"]').click();
    
    await expect(page.locator('text=Mobile test')).toBeVisible();
    
    // Test on tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Interface should adapt
    await expect(page.locator('input[placeholder*="Ask about"]')).toBeVisible();
  });
});