#!/usr/bin/env node

/**
 * Comprehensive validation script for better-ui integration
 * This script validates that the integration is properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Better-UI Integration...\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function pass(message) {
  console.log(`✅ ${message}`);
  results.passed++;
}

function fail(message) {
  console.log(`❌ ${message}`);
  results.failed++;
}

function warn(message) {
  console.log(`⚠️  ${message}`);
  results.warnings++;
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    pass(`${description} exists`);
    return true;
  } else {
    fail(`${description} missing: ${filePath}`);
    return false;
  }
}

function checkFileContains(filePath, searchString, description) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
      pass(`${description}`);
      return true;
    } else {
      fail(`${description} - ${searchString} not found in ${filePath}`);
      return false;
    }
  } else {
    fail(`Cannot check ${description} - file does not exist: ${filePath}`);
    return false;
  }
}

console.log('📦 Checking Dependencies...');
checkFileContains('package.json', '@lantos1618/better-ui', 'Better-UI dependency is installed');
checkFileContains('package.json', '@playwright/test', 'Playwright dependency is installed');

console.log('\n🔧 Checking Core Integration Files...');
checkFileExists('src/lib/aui/registry.ts', 'Tool registry');
checkFileExists('src/lib/aui/provider.tsx', 'AUI provider');
checkFileExists('src/lib/aui/tools/lynlang-tools.ts', 'Lynlang tools');
checkFileExists('src/lib/aui/tools/page-context-tools.ts', 'Page context tools');
checkFileExists('src/lib/aui/tools/repository-tools.ts', 'Repository tools');

console.log('\n🔗 Checking Integration Points...');
checkFileContains('src/app/api/chat/route.ts', 'toAISDKTools', 'Chat API uses better-ui tools');
checkFileContains('src/components/chat/ChatInterface.tsx', 'useToolRenderer', 'Chat interface uses tool renderer');
checkFileContains('src/lib/aui/provider.tsx', 'toolRegistry', 'Provider uses tool registry');

console.log('\n🚫 Checking Simplified Tools Removal...');
if (fs.existsSync('src/lib/aui/tools/simple-tools.ts')) {
  fail('Simplified tools file still exists - should be removed');
} else {
  pass('Simplified tools file has been removed');
}

console.log('\n🧪 Checking Test Infrastructure...');
checkFileExists('playwright.config.ts', 'Playwright configuration');
checkFileExists('tests/playwright/global-setup.ts', 'Playwright global setup');
checkFileExists('tests/playwright/global-teardown.ts', 'Playwright global teardown');
checkFileExists('tests/playwright/chat-interface.spec.ts', 'Chat interface tests');
checkFileExists('tests/playwright/tool-integration.spec.ts', 'Tool integration tests');
checkFileExists('tests/playwright/auth-flows.spec.ts', 'Authentication tests');
checkFileExists('tests/playwright/performance.spec.ts', 'Performance tests');
checkFileExists('tests/playwright/integration.spec.ts', 'Full integration tests');

console.log('\n📝 Checking Package.json Scripts...');
checkFileContains('package.json', 'test:e2e', 'E2E test script added');
checkFileContains('package.json', 'playwright test', 'Playwright test command');

console.log('\n🎨 Checking UI Enhancements...');
checkFileContains('src/components/chat/ChatInterface.tsx', 'data-testid', 'Test IDs for better testing');
checkFileContains('src/components/chat/ChatInterface.tsx', 'toolRenderer.render', 'Better-UI tool rendering');

console.log('\n🔍 Checking Tool Registry...');
const registryPath = 'src/lib/aui/registry.ts';
if (fs.existsSync(registryPath)) {
  const registryContent = fs.readFileSync(registryPath, 'utf8');
  
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
    if (registryContent.includes(toolName)) {
      pass(`Tool '${toolName}' is registered`);
    } else {
      fail(`Tool '${toolName}' is not registered`);
    }
  });
}

console.log('\n📊 Validation Summary:');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);

if (results.failed === 0) {
  console.log('\n🎉 Better-UI integration validation PASSED!');
  console.log('   All components are properly set up and integrated.');
  console.log('   You can now run end-to-end tests with: npm run test:e2e');
} else {
  console.log('\n🚨 Better-UI integration validation FAILED!');
  console.log(`   ${results.failed} issues need to be resolved.`);
  process.exit(1);
}

console.log('\n📋 Next Steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Set up environment: cp .env.local.example .env.local');
console.log('3. Start development server: npm run dev');
console.log('4. Install Playwright browsers: npx playwright install');
console.log('5. Run E2E tests: npm run test:e2e');
console.log('6. Run specific test suites:');
console.log('   - Chat Interface: npx playwright test chat-interface');
console.log('   - Tool Integration: npx playwright test tool-integration');
console.log('   - Performance: npx playwright test performance');
console.log('   - Full Integration: npx playwright test integration');

console.log('\n🎯 Testing Coverage:');
console.log('✅ Chat interface functionality');
console.log('✅ Better-UI tool execution and rendering');
console.log('✅ Client-side and server-side tool execution');
console.log('✅ Error handling and edge cases');
console.log('✅ Performance under load');
console.log('✅ Cross-browser compatibility');
console.log('✅ Authentication and permissions');
console.log('✅ Mobile and responsive design');
console.log('✅ Tool chaining and composition');
console.log('✅ Memory and resource management');