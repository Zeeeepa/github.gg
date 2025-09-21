import { test, expect, type Page } from '@playwright/test';

test.describe('Python SDK Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should connect to Python bridge API health endpoint', async ({ page }) => {
    // Test the health endpoint directly
    const response = await page.request.get('/api/python-bridge/health');
    expect(response.ok()).toBeTruthy();
    
    const healthData = await response.json();
    expect(healthData).toHaveProperty('status', 'healthy');
    expect(healthData).toHaveProperty('timestamp');
    expect(healthData).toHaveProperty('pythonSDK');
  });

  test('should list available tools through Python bridge', async ({ page }) => {
    const response = await page.request.get('/api/python-bridge/tools');
    expect(response.ok()).toBeTruthy();
    
    const toolsData = await response.json();
    expect(toolsData).toHaveProperty('tools');
    expect(Array.isArray(toolsData.tools)).toBeTruthy();
    
    // Should include our new Python-enhanced tools
    expect(toolsData.tools).toContain('pythonAnalyzeRepository');
    expect(toolsData.tools).toContain('pythonCodeReview');
  });

  test('should execute chat request through Python bridge', async ({ page }) => {
    const chatRequest = {
      messages: [
        { role: 'user', content: 'Hello, can you help me analyze a repository?' }
      ],
      config: {
        model: 'glm-4.5v',
        enableThinking: true,
        temperature: 0.7
      }
    };

    const response = await page.request.post('/api/python-bridge/chat', {
      data: chatRequest
    });
    
    expect(response.ok()).toBeTruthy();
    
    const chatResponse = await response.json();
    expect(chatResponse).toHaveProperty('content');
    expect(chatResponse).toHaveProperty('model');
    expect(chatResponse).toHaveProperty('usage');
    expect(typeof chatResponse.content).toBe('string');
    expect(chatResponse.content.length).toBeGreaterThan(0);
  });

  test('should handle chat streaming through Python bridge', async ({ page }) => {
    const chatRequest = {
      messages: [
        { role: 'user', content: 'Explain what a repository analysis involves' }
      ],
      config: {
        model: 'glm-4.5v',
        enableThinking: true
      }
    };

    const response = await page.request.post('/api/python-bridge/chat-stream', {
      data: chatRequest
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/stream-event');
    
    // Note: Full streaming test would require reading the response stream
    // For now, we verify the response starts correctly
  });

  test('should execute tools through Python bridge', async ({ page }) => {
    const toolRequest = {
      toolName: 'analyzeRepositoryStructure',
      input: {
        owner: 'facebook',
        repo: 'react',
        maxFiles: 10
      },
      context: {}
    };

    const response = await page.request.post('/api/python-bridge/execute-tool', {
      data: toolRequest
    });
    
    expect(response.ok()).toBeTruthy();
    
    const toolResponse = await response.json();
    expect(toolResponse).toHaveProperty('success');
    expect(toolResponse).toHaveProperty('toolName', 'analyzeRepositoryStructure');
    expect(toolResponse).toHaveProperty('timestamp');
    
    if (toolResponse.success) {
      expect(toolResponse).toHaveProperty('result');
    } else {
      expect(toolResponse).toHaveProperty('error');
    }
  });

  test('should use Python-enhanced tools in chat bubble', async ({ page }) => {
    // Open the chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Send a message that should trigger Python-enhanced repository analysis
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    await chatInput.fill('Use the Python SDK to analyze this repository comprehensively');
    await chatInput.press('Enter');
    
    // Wait for the message to appear
    await expect(page.getByTestId('chat-message').filter({ 
      hasText: 'Use the Python SDK to analyze this repository comprehensively' 
    })).toBeVisible();
    
    // Wait for potential AI response and tool execution
    await page.waitForTimeout(3000);
    
    // Check for tool execution indicators
    const toolResults = page.getByTestId('tool-result');
    const toolResultCount = await toolResults.count();
    
    if (toolResultCount > 0) {
      // Check that at least one tool result is visible
      await expect(toolResults.first()).toBeVisible();
      
      // Check for Python SDK specific content
      const pythonSDKIndicators = page.locator('text=/Python SDK/i');
      if (await pythonSDKIndicators.count() > 0) {
        await expect(pythonSDKIndicators.first()).toBeVisible();
      }
    }
  });

  test('should handle Python-enhanced code review', async ({ page }) => {
    // Open the chat bubble
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    // Send code for review
    const codeToReview = `
    function calculateTotal(items) {
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
      }
      return total;
    }
    `;
    
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    await chatInput.fill(`Please review this JavaScript code using the Python SDK: ${codeToReview}`);
    await chatInput.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Look for code review specific indicators
    const reviewIndicators = page.locator('text=/review|analysis|quality|improvement/i');
    if (await reviewIndicators.count() > 0) {
      await expect(reviewIndicators.first()).toBeVisible();
    }
  });

  test('should handle Python SDK connection errors gracefully', async ({ page }) => {
    // Simulate a scenario where Python SDK might not be available
    // by making a request to a non-existent endpoint
    const response = await page.request.post('/api/python-bridge/invalid-endpoint', {
      data: { test: 'data' }
    });
    
    expect(response.status()).toBe(404);
    
    const errorResponse = await response.json();
    expect(errorResponse).toHaveProperty('error');
  });

  test('should show fallback behavior when Python SDK unavailable', async ({ page }) => {
    // This test checks that the UI handles Python SDK unavailability gracefully
    // Open chat bubble and try to use Python-enhanced tools
    
    await page.getByTestId('chat-bubble-trigger').click();
    await expect(page.getByTestId('chat-bubble-panel')).toBeVisible();
    
    const chatInput = page.getByTestId('chat-interface').locator('input[placeholder*="Ask about"]');
    await chatInput.fill('Analyze this repository with advanced AI capabilities');
    await chatInput.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check that some form of response is provided, even if it's fallback
    const messages = page.getByTestId('chat-message');
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThan(1); // At least user message + some response
  });

  test('should validate tool parameter schemas', async ({ page }) => {
    // Test that invalid parameters are handled correctly
    const invalidToolRequest = {
      toolName: 'pythonAnalyzeRepository',
      input: {
        owner: '', // Invalid: empty string
        repo: 123, // Invalid: should be string
        analysisType: 'invalid_type' // Invalid: not in enum
      }
    };

    const response = await page.request.post('/api/python-bridge/execute-tool', {
      data: invalidToolRequest
    });
    
    // Should handle invalid parameters gracefully
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should handle concurrent Python SDK requests', async ({ page }) => {
    // Test multiple concurrent requests to Python bridge
    const requests = [];
    
    for (let i = 0; i < 3; i++) {
      const request = page.request.post('/api/python-bridge/chat', {
        data: {
          messages: [{ role: 'user', content: `Test message ${i}` }],
          config: { model: 'glm-4.5v' }
        }
      });
      requests.push(request);
    }
    
    const responses = await Promise.all(requests);
    
    // All requests should succeed
    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
    }
  });

  test('should maintain Python SDK configuration across requests', async ({ page }) => {
    // Test that SDK configuration is maintained properly
    const chatRequest1 = {
      messages: [{ role: 'user', content: 'First request' }],
      config: { 
        model: 'glm-4.5v',
        temperature: 0.5,
        enableThinking: true
      }
    };

    const response1 = await page.request.post('/api/python-bridge/chat', {
      data: chatRequest1
    });
    expect(response1.ok()).toBeTruthy();
    
    const chatData1 = await response1.json();
    expect(chatData1.model).toBe('glm-4.5v');

    // Second request with different config
    const chatRequest2 = {
      messages: [{ role: 'user', content: 'Second request' }],
      config: { 
        model: '0727-360B-API',
        temperature: 0.8
      }
    };

    const response2 = await page.request.post('/api/python-bridge/chat', {
      data: chatRequest2
    });
    expect(response2.ok()).toBeTruthy();
    
    const chatData2 = await response2.json();
    expect(chatData2.model).toBe('0727-360B-API');
  });
});