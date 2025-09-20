async function globalTeardown() {
  console.log('🧹 Starting global teardown for Playwright tests');
  
  // Add any global cleanup logic here
  // For example: cleaning up test data, stopping services, etc.
  
  console.log('✅ Global teardown completed successfully');
}

export default globalTeardown;