import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Playwright tests');

  // Launch browser for authentication setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000');
    
    // Wait for the app to be ready
    await page.waitForSelector('body', { timeout: 30000 });
    
    console.log('✅ Application is ready for testing');
    
    // You could perform authentication setup here if needed
    // For now, we'll just verify the app loads
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ Global setup completed successfully');
}

export default globalSetup;