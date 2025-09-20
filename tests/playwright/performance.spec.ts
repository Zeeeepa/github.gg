import { test, expect } from '@playwright/test';

test.describe('Performance and Load Testing', () => {
  test('should load chat interface within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/chat');
    
    // Wait for main interface elements
    await page.waitForSelector('input[placeholder*="Ask about"]');
    await page.waitForSelector('button[type="submit"]');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for performance metrics
    const navigationTiming = await page.evaluate(() => {
      return {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
      };
    });
    
    // DOM should be ready quickly
    expect(navigationTiming.domContentLoaded).toBeLessThan(2000);
    
    // First contentful paint should be fast
    if (navigationTiming.firstContentfulPaint) {
      expect(navigationTiming.firstContentfulPaint).toBeLessThan(1500);
    }
  });

  test('should handle rapid tool executions without performance degradation', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Measure performance of rapid executions
    const startTime = Date.now();
    
    // Send multiple messages rapidly
    for (let i = 0; i < 5; i++) {
      await chatInput.fill(`Performance test message ${i + 1}`);
      await sendButton.click();
      await page.waitForTimeout(100); // Small delay to prevent overwhelming
    }
    
    // Wait for all messages to appear
    await expect(page.locator('text=Performance test message 5')).toBeVisible({ timeout: 10000 });
    
    const totalTime = Date.now() - startTime;
    
    // Should handle rapid executions efficiently
    expect(totalTime).toBeLessThan(15000); // 15 seconds for 5 rapid messages
    
    // Interface should remain responsive
    await expect(chatInput).toBeEnabled();
    await expect(sendButton).toBeEnabled();
  });

  test('should efficiently render large tool results', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Request analysis of a large repository
    await chatInput.fill('Analyze the complete structure of microsoft/vscode repository');
    await sendButton.click();
    
    const startTime = Date.now();
    
    // Wait for tool result
    await expect(page.locator('.tool-result')).toBeVisible({ timeout: 60000 });
    
    const renderTime = Date.now() - startTime;
    
    // Should render results within reasonable time even for large repos
    expect(renderTime).toBeLessThan(60000); // 1 minute max
    
    // Check that the page remains responsive
    const isResponsive = await page.evaluate(() => {
      // Check if the page can still handle interactions
      const input = document.querySelector('input[placeholder*="Ask about"]') as HTMLInputElement;
      return input && !input.disabled;
    });
    
    expect(isResponsive).toBeTruthy();
  });

  test('should maintain good performance with multiple tool results', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Execute multiple tools to build up chat history
    const tools = [
      'Analyze current page context',
      'Get info about any public repository',
      'Compare two simple code snippets: "let a = 1" and "const b = 2"'
    ];
    
    for (const toolPrompt of tools) {
      await chatInput.fill(toolPrompt);
      await sendButton.click();
      await page.waitForTimeout(3000); // Wait between executions
    }
    
    // Wait for all results
    await page.waitForTimeout(5000);
    
    // Measure scroll performance with multiple results
    const scrollPerformance = await page.evaluate(() => {
      const startTime = performance.now();
      
      // Scroll to bottom and back to top
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]') || window;
      if ('scrollTop' in scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
        scrollArea.scrollTop = 0;
      } else {
        window.scrollTo(0, document.body.scrollHeight);
        window.scrollTo(0, 0);
      }
      
      return performance.now() - startTime;
    });
    
    // Scrolling should be smooth even with multiple results
    expect(scrollPerformance).toBeLessThan(100); // Should scroll smoothly within 100ms
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/chat');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Execute tools that might use memory
    for (let i = 0; i < 10; i++) {
      await chatInput.fill(`Memory test ${i + 1}: analyze small code snippet`);
      await sendButton.click();
      await page.waitForTimeout(1000);
    }
    
    await page.waitForTimeout(5000);
    
    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      // Memory increase should be reasonable (less than 50MB for 10 tool executions)
      expect(memoryIncreaseMB).toBeLessThan(50);
    }
  });

  test('should handle network latency gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async (route) => {
      // Add delay to all requests
      await new Promise(resolve => setTimeout(resolve, 200));
      await route.continue();
    });
    
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Test that the interface remains responsive during slow network
    await chatInput.fill('Test with slow network');
    await sendButton.click();
    
    // Should show loading state appropriately
    await expect(page.locator('text=Thinking...')).toBeVisible({ timeout: 5000 });
    
    // Should eventually complete despite slow network
    await expect(page.locator('text=Test with slow network')).toBeVisible({ timeout: 15000 });
    
    // Interface should remain usable
    await expect(chatInput).toBeEnabled();
  });

  test('should optimize bundle size and loading', async ({ page }) => {
    // Check for efficient resource loading
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      return {
        totalSize: resources.reduce((total, resource) => total + (resource.transferSize || 0), 0),
        jsResources: resources.filter(r => r.name.includes('.js')),
        cssResources: resources.filter(r => r.name.includes('.css')),
        largestResource: resources.reduce((largest, current) => 
          (current.transferSize || 0) > (largest.transferSize || 0) ? current : largest
        )
      };
    });
    
    // Total bundle size should be reasonable (less than 5MB)
    expect(resourceSizes.totalSize).toBeLessThan(5 * 1024 * 1024);
    
    // No single resource should be excessively large (less than 2MB)
    expect(resourceSizes.largestResource.transferSize || 0).toBeLessThan(2 * 1024 * 1024);
  });

  test('should handle concurrent users simulation', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(context => context.newPage()));
    
    // All users navigate to chat
    await Promise.all(pages.map(page => page.goto('/chat')));
    
    // All users send messages simultaneously
    const userActions = pages.map(async (page, index) => {
      const chatInput = page.locator('input[placeholder*="Ask about"]');
      const sendButton = page.locator('button[type="submit"]');
      
      await chatInput.fill(`Concurrent user ${index + 1} test message`);
      await sendButton.click();
      
      // Wait for response
      await page.waitForSelector(`text=Concurrent user ${index + 1} test message`, { timeout: 15000 });
    });
    
    // All should complete without errors
    await Promise.all(userActions);
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });
});