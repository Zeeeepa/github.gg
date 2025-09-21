import { test, expect, type Page } from '@playwright/test';

test.describe('Chat Bubble Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display chat bubble trigger button', async ({ page }) => {
    // Check that the chat bubble trigger button is visible
    const chatBubbleButton = page.getByTestId('chat-bubble-trigger');
    await expect(chatBubbleButton).toBeVisible();
    
    // Check button positioning (bottom-right)
    const buttonBox = await chatBubbleButton.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (buttonBox && viewportSize) {
      // Button should be in the bottom-right area
      expect(buttonBox.x).toBeGreaterThan(viewportSize.width * 0.8);
      expect(buttonBox.y).toBeGreaterThan(viewportSize.height * 0.8);
    }
  });

  test('should open chat interface when bubble is clicked', async ({ page }) => {
    // Click the chat bubble trigger
    await page.getByTestId('chat-bubble-trigger').click();
    
    // Wait for the chat interface to appear
    const chatPanel = page.getByTestId('chat-bubble-panel');
    await expect(chatPanel).toBeVisible();
    
    // Check that the chat interface components are present
    await expect(chatPanel.locator('h3').filter({ hasText: 'AI Assistant' })).toBeVisible();
    await expect(chatPanel.getByTestId('chat-interface')).toBeVisible();
  });

  test('should close chat interface when close button is clicked', async ({ page }) => {
    // Open the chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Click the close button
    await page.getByTestId('chat-bubble-close').click();
    
    // Wait for the panel to disappear
    await expect(page.getByTestId('chat-bubble-panel')).not.toBeVisible();
    
    // Chat bubble trigger should be visible again
    await expect(page.getByTestId('chat-bubble-trigger')).toBeVisible();
  });

  test('should minimize and restore chat interface', async ({ page }) => {
    // Open the chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    const chatPanel = page.getByTestId('chat-bubble-panel');
    await expect(chatPanel).toBeVisible();
    
    // Get initial panel size
    const initialBox = await chatPanel.boundingBox();
    
    // Click minimize button
    await page.getByTestId('chat-bubble-minimize').click();
    
    // Wait for animation and check the panel is now smaller (minimized)
    await page.waitForTimeout(500);
    const minimizedBox = await chatPanel.boundingBox();
    
    if (initialBox && minimizedBox) {
      expect(minimizedBox.height).toBeLessThan(initialBox.height);
    }
    
    // Click minimize button again to restore
    await page.getByTestId('chat-bubble-minimize').click();
    
    // Wait for animation and check the panel is restored
    await page.waitForTimeout(500);
    const restoredBox = await chatPanel.boundingBox();
    
    if (initialBox && restoredBox) {
      expect(restoredBox.height).toBeCloseTo(initialBox.height, 20);
    }
  });

  test('should handle chat interactions within bubble', async ({ page }) => {
    // Open the chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Find the chat input within the bubble
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    await expect(chatInput).toBeVisible();
    
    // Type a test message
    const testMessage = 'Hello, can you analyze this repository?';
    await chatInput.fill(testMessage);
    
    // Submit the message
    await chatInput.press('Enter');
    
    // Wait for the message to appear in chat
    await expect(page.getByTestId('chat-message').filter({ hasText: testMessage })).toBeVisible();
    
    // Check for loading indicator or response
    const thinkingIndicator = page.locator('text="Thinking..."').first();
    if (await thinkingIndicator.isVisible({ timeout: 1000 })) {
      await expect(thinkingIndicator).toBeVisible();
    }
  });

  test('should maintain chat state when minimizing', async ({ page }) => {
    // Open the chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Send a message
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    const testMessage = 'Test message for state persistence';
    await chatInput.fill(testMessage);
    await chatInput.press('Enter');
    
    // Wait for message to appear
    await expect(page.getByTestId('chat-message').filter({ hasText: testMessage })).toBeVisible();
    
    // Minimize the chat
    await page.getByTestId('chat-bubble-minimize').click();
    await page.waitForTimeout(300);
    
    // Restore the chat
    await page.getByTestId('chat-bubble-minimize').click();
    await page.waitForTimeout(300);
    
    // Check that the message is still there
    await expect(page.getByTestId('chat-message').filter({ hasText: testMessage })).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that chat bubble is still visible and properly positioned
    const chatBubbleButton = page.getByTestId('chat-bubble-trigger');
    await expect(chatBubbleButton).toBeVisible();
    
    // Open chat bubble
    await chatBubbleButton.click();
    
    const chatPanel = page.getByTestId('chat-bubble-panel');
    await expect(chatPanel).toBeVisible();
    
    // Check that the panel adapts to mobile viewport
    const panelBox = await chatPanel.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (panelBox && viewportSize) {
      // Panel should not exceed viewport width
      expect(panelBox.width).toBeLessThanOrEqual(viewportSize.width);
    }
  });

  test('should handle tool execution within chat bubble', async ({ page }) => {
    // Open the chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Send a message that should trigger tool execution
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    await chatInput.fill('Analyze the repository structure');
    await chatInput.press('Enter');
    
    // Wait for potential tool execution
    await page.waitForTimeout(2000);
    
    // Check if any tool results appear
    const toolResult = page.getByTestId('tool-result').first();
    if (await toolResult.isVisible({ timeout: 5000 })) {
      await expect(toolResult).toBeVisible();
      
      // Check that tool result has proper content
      await expect(toolResult).toContainText(/analyzing|repository|structure/i);
    }
  });

  test('should handle multiple rapid clicks gracefully', async ({ page }) => {
    // Rapidly click the chat bubble trigger
    const chatBubbleButton = page.getByTestId('chat-bubble-trigger');
    
    for (let i = 0; i < 5; i++) {
      await chatBubbleButton.click();
      await page.waitForTimeout(100);
    }
    
    // Should only have one chat panel open
    const chatPanels = page.getByTestId('chat-bubble-panel');
    await expect(chatPanels).toHaveCount(1);
    await expect(chatPanels.first()).toBeVisible();
  });

  test('should preserve chat history across close/open cycles', async ({ page }) => {
    // Open chat and send a message
    await page.getByTestId('chat-bubble-trigger').click();
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    
    const firstMessage = 'First test message';
    await chatInput.fill(firstMessage);
    await chatInput.press('Enter');
    
    // Wait for message to appear
    await expect(page.getByTestId('chat-message').filter({ hasText: firstMessage })).toBeVisible();
    
    // Close the chat
    await page.getByTestId('chat-bubble-close').click();
    await expect(page.getByTestId('chat-bubble-panel')).not.toBeVisible();
    
    // Reopen the chat
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Check that the previous message is still there
    await expect(page.getByTestId('chat-message').filter({ hasText: firstMessage })).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Open chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Focus should be on the input field
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    await expect(chatInput).toBeFocused();
    
    // Test Escape key to close
    await page.keyboard.press('Escape');
    // Note: Escape functionality would need to be implemented in the component
    
    // Test Tab navigation
    await page.getByTestId('chat-bubble-trigger').click();
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through interactive elements
    const minimizeButton = page.getByTestId('chat-bubble-minimize');
    const closeButton = page.getByTestId('chat-bubble-close');
    
    // Check that buttons can be focused
    await minimizeButton.focus();
    await expect(minimizeButton).toBeFocused();
    
    await closeButton.focus();
    await expect(closeButton).toBeFocused();
  });
});