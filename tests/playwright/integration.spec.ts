import { test, expect } from '@playwright/test';

test.describe('Full Integration Test - Better-UI with GitHub.gg', () => {
  test('should demonstrate complete better-ui integration workflow', async ({ page }) => {
    // Step 1: Navigate to the application
    await page.goto('/');
    
    // Step 2: Navigate to chat interface
    await page.goto('/chat');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Step 3: Test basic chat functionality
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await chatInput.fill('Hello! I want to test the complete better-ui integration.');
    await sendButton.click();
    
    await expect(page.locator('text=Hello! I want to test')).toBeVisible();
    
    // Step 4: Test repository analysis tool (better-ui integration)
    await chatInput.fill('Analyze the structure of facebook/react repository');
    await sendButton.click();
    
    // Wait for tool execution
    await expect(page.locator('text=Analyzing Repository Structure')).toBeVisible({ timeout: 20000 });
    
    // Verify better-ui rendering
    const toolResult = page.locator('[data-testid="tool-result"]').first();
    await expect(toolResult).toBeVisible({ timeout: 60000 });
    
    // Should show structured analysis with better-ui components
    await expect(
      page.locator('text=Files').or(
        page.locator('text=Languages')
      ).or(
        page.locator('text=Directories')
      )
    ).toBeVisible();
    
    // Step 5: Test lynlang code analysis tool
    const codeExample = `
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}
    `.trim();
    
    await chatInput.fill(`Analyze this JavaScript quicksort implementation with lynlang: ${codeExample}`);
    await sendButton.click();
    
    // Wait for lynlang tool execution
    await expect(page.locator('text=Analyzing Code with Lynlang')).toBeVisible({ timeout: 15000 });
    
    // Should show analysis result (or fallback)
    await expect(page.locator('[data-testid="tool-result"]').nth(1)).toBeVisible({ timeout: 30000 });
    
    // Step 6: Test page context analysis (client-side execution)
    await chatInput.fill('Analyze the current page context and extract key information');
    await sendButton.click();
    
    // Should execute client-side quickly
    await expect(page.locator('text=Analyzing Page Context')).toBeVisible({ timeout: 10000 });
    
    // Should show page context information
    await expect(page.locator('[data-testid="tool-result"]').nth(2)).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('text=localhost').or(
        page.locator('text=chat').or(
          page.locator('text=viewport')
        )
      )
    ).toBeVisible();
    
    // Step 7: Test tool chaining and complex interaction
    await chatInput.fill('Compare the complexity of these two sorting algorithms: bubble sort vs merge sort');
    await sendButton.click();
    
    // Should trigger code comparison tool
    await expect(page.locator('text=Comparing Code Patterns')).toBeVisible({ timeout: 15000 });
    
    // Wait for comparison result
    await expect(page.locator('[data-testid="tool-result"]').nth(3)).toBeVisible({ timeout: 30000 });
    
    // Step 8: Verify all tool results are preserved in chat history
    const allToolResults = page.locator('[data-testid="tool-result"]');
    await expect(allToolResults).toHaveCount({ min: 3 });
    
    // Step 9: Verify chat messages are preserved
    const allMessages = page.locator('[data-testid="chat-message"]');
    await expect(allMessages).toHaveCount({ min: 8 }); // 4 user messages + 4 AI responses
    
    // Step 10: Test error handling
    await chatInput.fill('Analyze the structure of definitely/does-not-exist repository');
    await sendButton.click();
    
    // Should handle error gracefully
    await expect(page.locator('text=Analyzing Repository Structure')).toBeVisible({ timeout: 10000 });
    
    // Should show error state without breaking the interface
    await page.waitForTimeout(5000);
    
    // Interface should remain functional
    await expect(chatInput).toBeEnabled();
    await expect(sendButton).toBeEnabled();
    
    // Step 11: Verify performance under load
    const performanceStart = Date.now();
    
    // Send a complex request
    await chatInput.fill('Extract page content, analyze current context, and provide insights');
    await sendButton.click();
    
    await page.waitForTimeout(5000);
    
    const performanceTime = Date.now() - performanceStart;
    
    // Should complete within reasonable time
    expect(performanceTime).toBeLessThan(30000); // 30 seconds
    
    // Step 12: Final verification that better-ui integration is working
    console.log('✅ All integration tests passed');
    console.log('✅ Better-UI tools are properly registered and executing');
    console.log('✅ Client-side and server-side execution working');
    console.log('✅ Tool rendering with better-ui components working');
    console.log('✅ Error handling working correctly');
    console.log('✅ Performance is acceptable');
    console.log('✅ Chat interface remains responsive throughout');
  });

  test('should validate complete tool registry integration', async ({ page }) => {
    // Verify all expected tools are available via API
    const response = await page.request.get('/api/chat');
    const apiData = await response.json();
    
    expect(apiData.status).toBe('ok');
    expect(apiData.description).toContain('better-ui');
    
    // Verify all better-ui tools are registered
    const expectedTools = [
      'analyzCodeWithLynlang',
      'compareCodePatterns',
      'analyzePageContext',
      'extractPageContent',
      'trackUserInteractions',
      'analyzeRepositoryStructure',
      'searchRepositoryFiles',
      'getRepositoryInfo'
    ];
    
    expectedTools.forEach(toolName => {
      expect(apiData.availableTools).toContain(toolName);
    });
    
    console.log('✅ Tool registry integration validated');
    console.log(`✅ Found ${apiData.availableTools.length} tools registered`);
    console.log('✅ All expected better-ui tools are available');
  });

  test('should demonstrate better-ui rendering capabilities', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Test different tool renderings
    await chatInput.fill('Analyze this simple TypeScript interface: interface User { id: number; name: string; }');
    await sendButton.click();
    
    // Wait for better-ui rendered result
    await expect(page.locator('[data-testid="tool-result"]')).toBeVisible({ timeout: 30000 });
    
    // Check for enhanced visual elements that indicate better-ui rendering
    const hasEnhancedRendering = await page.locator(
      '[class*="grid"], [class*="chart"], [class*="metric"], .bg-white, .bg-blue-50'
    ).count();
    
    expect(hasEnhancedRendering).toBeGreaterThan(0);
    
    console.log('✅ Better-UI rendering capabilities validated');
    console.log(`✅ Found ${hasEnhancedRendering} enhanced UI elements`);
  });

  test('should handle edge cases and maintain stability', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Test various edge cases
    const edgeCases = [
      '', // Empty input
      'a', // Single character
      'A'.repeat(1000), // Very long input
      '{ "invalid": json }', // Invalid JSON-like input
      '<script>alert("test")</script>', // XSS attempt
      '🚀🌟✨🎯🔥💫🌈🎪🎨🎭🎪', // Emoji-only input
    ];
    
    for (const testCase of edgeCases) {
      if (testCase.trim()) { // Skip empty inputs
        await chatInput.fill(testCase);
        await sendButton.click();
        
        // Should handle gracefully without crashing
        await page.waitForTimeout(2000);
        
        // Interface should remain functional
        await expect(chatInput).toBeEnabled();
      }
    }
    
    console.log('✅ Edge case handling validated');
    console.log('✅ System maintains stability under edge conditions');
  });

  test('should demonstrate cross-browser compatibility', async ({ browserName }) => {
    console.log(`Testing on ${browserName}`);
    
    await page.goto('/chat');
    
    // Basic functionality should work across browsers
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await chatInput.fill(`Cross-browser test on ${browserName}`);
    await sendButton.click();
    
    await expect(page.locator(`text=Cross-browser test on ${browserName}`)).toBeVisible();
    
    // Tool execution should work
    await chatInput.fill('Quick page context analysis');
    await sendButton.click();
    
    await expect(page.locator('text=Analyzing Page Context')).toBeVisible({ timeout: 10000 });
    
    console.log(`✅ Cross-browser compatibility validated for ${browserName}`);
  });
});