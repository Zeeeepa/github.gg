import { test, expect } from '@playwright/test';

test.describe('Basic Navigation and Interface', () => {
  test('should load homepage and navigate to key pages', async ({ page }) => {
    // Test homepage loading
    await page.goto('/');
    await expect(page).toHaveTitle(/GitHub\.gg/);
    
    // Check if page content loads
    await expect(page.locator('body')).toBeVisible();
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    
    console.log('✅ Homepage loaded successfully');
  });

  test('should navigate to chat page and verify basic elements', async ({ page }) => {
    await page.goto('/chat');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page has loaded content
    await expect(page.locator('body')).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/chat-page.png', fullPage: true });
    
    console.log('✅ Chat page navigation successful');
  });

  test('should demonstrate repository interaction', async ({ page }) => {
    // Test repository page access
    await page.goto('/facebook/react');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/repository-page.png', fullPage: true });
    
    console.log('✅ Repository page interaction successful');
  });

  test('should test user interface responsiveness', async ({ page }) => {
    await page.goto('/');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow for responsive changes
      
      // Verify page is still visible
      await expect(page.locator('body')).toBeVisible();
      
      // Take screenshot for this viewport
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.width}x${viewport.height}.png`,
        fullPage: false 
      });
      
      console.log(`✅ Responsive test passed for ${viewport.width}x${viewport.height}`);
    }
  });

  test('should verify better-ui tools are accessible', async ({ page }) => {
    await page.goto('/chat');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if any input elements exist (chat interface)
    const inputs = await page.locator('input, textarea').count();
    console.log(`✅ Found ${inputs} input elements on chat page`);
    
    // Check if any buttons exist
    const buttons = await page.locator('button').count();
    console.log(`✅ Found ${buttons} interactive buttons`);
    
    // Verify the page has interactive elements
    expect(inputs + buttons).toBeGreaterThan(0);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/chat-interface-elements.png', fullPage: true });
  });

  test('should interact with navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Look for navigation links
    const links = await page.locator('a').count();
    console.log(`✅ Found ${links} navigation links`);
    
    if (links > 0) {
      // Get all visible links
      const visibleLinks = await page.locator('a:visible').count();
      console.log(`✅ Found ${visibleLinks} visible links`);
      
      // Try to click on a navigation link if available
      const firstLink = page.locator('a:visible').first();
      const linkText = await firstLink.textContent();
      
      if (linkText && linkText.trim()) {
        console.log(`✅ Found clickable link: "${linkText}"`);
        
        // Take screenshot before interaction
        await page.screenshot({ path: 'test-results/before-navigation.png' });
        
        // Click the link (if it's not an external link)
        const href = await firstLink.getAttribute('href');
        if (href && !href.startsWith('http') && !href.includes('//')) {
          await firstLink.click();
          await page.waitForLoadState('networkidle');
          
          // Take screenshot after navigation
          await page.screenshot({ path: 'test-results/after-navigation.png' });
          console.log(`✅ Successfully navigated to: ${href}`);
        }
      }
    }
  });
});