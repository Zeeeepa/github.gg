import { test, expect } from '@playwright/test';

test.describe('Better-UI Tool Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    // Wait for the application to be ready
    await page.waitForSelector('[data-testid="chat-interface"], input[placeholder*="Ask about"]');
  });

  test('should register all better-ui tools correctly', async ({ page }) => {
    // Test that the tools API endpoint returns the expected tools
    const response = await page.request.get('/api/chat');
    const data = await response.json();
    
    expect(data.status).toBe('ok');
    expect(data.availableTools).toBeDefined();
    expect(Array.isArray(data.availableTools)).toBe(true);
    
    // Check for expected tool names
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
      expect(data.availableTools).toContain(toolName);
    });
  });

  test('should execute lynlang code analysis with proper rendering', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Test with TypeScript code
    const typeScriptCode = `
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(userData: Partial<User>): User {
  return {
    id: Math.random(),
    name: userData.name || 'Unknown',
    email: userData.email || 'unknown@example.com'
  };
}
    `;
    
    await chatInput.fill(`Analyze this TypeScript code: ${typeScriptCode}`);
    await sendButton.click();
    
    // Wait for tool execution
    await expect(page.locator('text=Analyzing Code with Lynlang')).toBeVisible({ timeout: 10000 });
    
    // Check for better-ui rendered result
    const toolResult = page.locator('.tool-result, [class*="better-ui"]').first();
    await expect(toolResult).toBeVisible({ timeout: 30000 });
    
    // Should show analysis metrics or fallback
    await expect(
      page.locator('text=Lines').or(
        page.locator('text=Complexity')
      ).or(
        page.locator('text=basic analysis')
      ).or(
        page.locator('text=fallback')
      )
    ).toBeVisible();
  });

  test('should execute repository structure analysis with enhanced rendering', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await chatInput.fill('Analyze the structure of microsoft/TypeScript repository');
    await sendButton.click();
    
    // Wait for tool execution
    await expect(page.locator('text=Analyzing Repository Structure')).toBeVisible({ timeout: 15000 });
    
    // Wait for results with better-ui rendering
    const toolResult = page.locator('.tool-result').first();
    await expect(toolResult).toBeVisible({ timeout: 45000 });
    
    // Should show structured data about the repository
    await expect(
      page.locator('text=Files').or(
        page.locator('text=Languages')
      ).or(
        page.locator('text=Directories')
      )
    ).toBeVisible();
    
    // Check for enhanced visual representation
    await expect(
      page.locator('[class*="grid"], [class*="chart"], .bg-white').first()
    ).toBeVisible();
  });

  test('should execute page context analysis on client-side', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await chatInput.fill('Analyze the current page context');
    await sendButton.click();
    
    // Wait for client-side tool execution
    await expect(page.locator('text=Analyzing Page Context')).toBeVisible({ timeout: 10000 });
    
    // Should execute quickly since it's client-side
    const toolResult = page.locator('.tool-result').first();
    await expect(toolResult).toBeVisible({ timeout: 10000 });
    
    // Should show current page information
    await expect(
      page.locator('text=localhost').or(
        page.locator('text=chat')
      ).or(
        page.locator('text=viewport')
      )
    ).toBeVisible();
  });

  test('should show tool execution states correctly', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await chatInput.fill('Search for React hooks in facebook/react repository');
    await sendButton.click();
    
    // Should show calling state with spinner
    await expect(page.locator('text=Searching Repository Files')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.animate-spin')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('.animate-spin')).toBeHidden({ timeout: 30000 });
    
    // Should show result state
    await expect(page.locator('.tool-result')).toBeVisible();
  });

  test('should handle tool execution errors with proper UI feedback', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Try to analyze invalid repository
    await chatInput.fill('Analyze the structure of invalid/nonexistent-repo');
    await sendButton.click();
    
    // Should show error state
    await expect(
      page.locator('text=Tool execution failed').or(
        page.locator('text=not found').or(
          page.locator('text=error')
        )
      )
    ).toBeVisible({ timeout: 20000 });
    
    // Error should be displayed in a user-friendly way
    await expect(page.locator('[class*="error"], [class*="red"]')).toBeVisible();
  });

  test('should support tool chaining and composition', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Request analysis that might trigger multiple tools
    await chatInput.fill('Analyze the React components in facebook/react and compare their patterns');
    await sendButton.click();
    
    // Should potentially execute multiple tools in sequence
    await page.waitForTimeout(2000);
    
    // Look for multiple tool executions
    const toolExecutions = page.locator('[class*="tool"], .tool-result');
    
    // Wait for at least one tool to complete
    await expect(toolExecutions.first()).toBeVisible({ timeout: 30000 });
  });

  test('should maintain tool execution history', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Execute first tool
    await chatInput.fill('Analyze current page context');
    await sendButton.click();
    await expect(page.locator('text=Analyzing Page Context')).toBeVisible();
    await page.waitForTimeout(3000);
    
    // Execute second tool
    await chatInput.fill('Get basic repository info for any public repo');
    await sendButton.click();
    await expect(page.locator('text=Getting Repository Info')).toBeVisible();
    await page.waitForTimeout(3000);
    
    // Both tool results should be visible in history
    const toolResults = page.locator('.tool-result, [class*="tool"]');
    await expect(toolResults).toHaveCount({ min: 2 });
  });

  test('should render tool results with better-ui components', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await chatInput.fill('Compare these two code snippets: "const a = 1;" and "let b = 2;"');
    await sendButton.click();
    
    // Wait for comparison tool
    await expect(page.locator('text=Comparing Code Patterns')).toBeVisible({ timeout: 15000 });
    
    // Wait for better-ui rendered comparison result
    const toolResult = page.locator('.tool-result').first();
    await expect(toolResult).toBeVisible({ timeout: 30000 });
    
    // Should show comparison metrics with better-ui styling
    await expect(
      page.locator('text=Similarity').or(
        page.locator('text=difference').or(
          page.locator('[class*="comparison"], [class*="metric"]')
        )
      )
    ).toBeVisible();
  });

  test('should handle concurrent tool executions', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about"]');
    const sendButton = page.locator('button[type="submit"]');
    
    // Send a message that might trigger multiple tools
    await chatInput.fill('Analyze the TypeScript files in microsoft/TypeScript, extract the main page content, and check current page context');
    await sendButton.click();
    
    // Should handle multiple tool executions gracefully
    await page.waitForTimeout(5000);
    
    // Look for multiple tool execution indicators
    const toolExecutions = page.locator('[class*="tool"], text*="Analyzing"');
    
    // At least one should be visible
    await expect(toolExecutions.first()).toBeVisible({ timeout: 20000 });
    
    // All should eventually complete without errors
    await page.waitForTimeout(10000);
    await expect(page.locator('text=failed').or(page.locator('text=error'))).toHaveCount({ max: 1 });
  });
});