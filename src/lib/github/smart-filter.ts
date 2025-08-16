/**
 * Smart filtering system for GitHub repository files
 * Prioritizes files most relevant for diagram generation using a scoring system
 */

import { DiagramType } from '@/lib/types/diagram';

export interface ScoredFile {
  path: string;
  content: string;
  size: number;
  score: number;
  reasons: string[];
}

export interface SmartFilterConfig {
  maxFiles: number;
  diagramType?: DiagramType;
  includeTests?: boolean;
  includeConfig?: boolean;
  prioritizeCore?: boolean;
}

export const DEFAULT_SMART_FILTER_CONFIG: SmartFilterConfig = {
  maxFiles: 25, // Aggressive reduction for better AI processing
  includeTests: false, // Tests rarely help with architecture diagrams
  includeConfig: true, // Config files show system setup
  prioritizeCore: true, // Focus on main application code
};

/**
 * Calculates relevance score for a file based on multiple criteria
 */
export function calculateFileScore(
  filePath: string, 
  content: string, 
  diagramType: DiagramType = 'flowchart',
  config: SmartFilterConfig = DEFAULT_SMART_FILTER_CONFIG
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const fileName = filePath.split('/').pop() || '';
  const extension = fileName.includes('.') ? '.' + fileName.split('.').pop()?.toLowerCase() : '';
  const pathParts = filePath.toLowerCase().split('/');
  
  // Base scores by file type and importance
  
  // 1. Core application files (highest priority)
  if (isMainEntryPoint(filePath, fileName)) {
    score += 100;
    reasons.push('Main entry point');
  }
  
  if (isRouteFile(filePath)) {
    score += 80;
    reasons.push('Route/API endpoint');
  }
  
  if (isComponentFile(filePath)) {
    score += 70;
    reasons.push('Component file');
  }
  
  if (isServiceFile(filePath)) {
    score += 75;
    reasons.push('Service/utility file');
  }
  
  // 2. Configuration and setup files
  if (config.includeConfig && isConfigFile(filePath, fileName)) {
    score += 60;
    reasons.push('Configuration file');
  }
  
  // 3. Documentation with code examples
  if (isDocumentationWithCode(content, extension)) {
    score += 40;
    reasons.push('Documentation with code');
  }
  
  // 4. Database/schema files
  if (isDatabaseFile(filePath)) {
    score += 65;
    reasons.push('Database/schema file');
  }
  
  // 5. Middleware/auth files
  if (isMiddlewareFile(filePath)) {
    score += 70;
    reasons.push('Middleware/auth file');
  }
  
  // 6. Hook/custom logic files
  if (isHookOrCustomLogic(filePath)) {
    score += 55;
    reasons.push('Hook/custom logic');
  }
  
  // Diagram type specific scoring
  switch (diagramType) {
    case 'flowchart':
    case 'sequence':
      // Prioritize files that show data flow and interactions
      if (hasApiCalls(content)) {
        score += 30;
        reasons.push('Contains API calls');
      }
      if (hasStateManagement(content)) {
        score += 25;
        reasons.push('State management');
      }
      break;
      
    case 'class':
      // Prioritize files with class definitions and interfaces
      if (hasClassDefinitions(content)) {
        score += 40;
        reasons.push('Class definitions');
      }
      if (hasTypeDefinitions(content)) {
        score += 35;
        reasons.push('Type definitions');
      }
      break;
      
    case 'gitgraph':
      // Prioritize git and deployment related files
      if (isGitOrDeploymentFile(filePath)) {
        score += 50;
        reasons.push('Git/deployment config');
      }
      break;
      
    case 'gantt':
      // Prioritize project management and documentation files
      if (isProjectManagementFile(filePath, content)) {
        score += 60;
        reasons.push('Project management');
      }
      break;
  }
  
  // Penalties
  
  // Test files (unless specifically requested)
  if (!config.includeTests && isTestFile(filePath)) {
    score = Math.max(0, score - 50);
    reasons.push('Test file (penalty)');
  }
  
  // Generated/compiled files
  if (isGeneratedFile(filePath)) {
    score = Math.max(0, score - 40);
    reasons.push('Generated file (penalty)');
  }
  
  // Very large files (>50KB) - harder for AI to process
  if (content.length > 50000) {
    score = Math.max(0, score - 30);
    reasons.push('Large file (penalty)');
  }
  
  // Empty or very small files
  if (content.trim().length < 50) {
    score = Math.max(0, score - 20);
    reasons.push('Empty/minimal content (penalty)');
  }
  
  // Files in deep nested directories (often less important)
  if (pathParts.length > 6) {
    score = Math.max(0, score - 15);
    reasons.push('Deep nesting (penalty)');
  }
  
  // Boost for files in important directories
  if (isInImportantDirectory(filePath)) {
    score += 20;
    reasons.push('Important directory');
  }
  
  return { score: Math.max(0, score), reasons };
}

/**
 * Applies smart filtering to a list of files
 */
export function applySmartFilter(
  files: Array<{ path: string; content: string; size: number }>,
  config: SmartFilterConfig = DEFAULT_SMART_FILTER_CONFIG
): ScoredFile[] {
  // Score all files
  const scoredFiles: ScoredFile[] = files.map(file => {
    const { score, reasons } = calculateFileScore(
      file.path, 
      file.content, 
      config.diagramType, 
      config
    );
    
    return {
      ...file,
      score,
      reasons,
    };
  });
  
  // Sort by score (highest first) and take top N
  return scoredFiles
    .sort((a, b) => b.score - a.score)
    .slice(0, config.maxFiles);
}

// Helper functions for file type detection

function isMainEntryPoint(filePath: string, fileName: string): boolean {
  const mainFiles = ['main.', 'index.', 'app.', 'server.', 'entry.'];
  const specialFiles = ['page.tsx', 'layout.tsx', '_app.', '_document.'];
  
  return mainFiles.some(prefix => fileName.startsWith(prefix)) ||
         specialFiles.some(special => fileName.includes(special)) ||
         filePath.includes('src/main') ||
         filePath === 'src/app.ts' ||
         filePath === 'src/index.ts';
}

function isRouteFile(filePath: string): boolean {
  return filePath.includes('/routes/') ||
         filePath.includes('/api/') ||
         filePath.includes('/pages/') ||
         filePath.includes('/app/') && filePath.includes('route.') ||
         filePath.includes('/controllers/');
}

function isComponentFile(filePath: string): boolean {
  return filePath.includes('/components/') ||
         filePath.includes('/ui/') ||
         filePath.includes('/widgets/') ||
         filePath.endsWith('.vue') ||
         filePath.endsWith('.svelte') ||
         (filePath.endsWith('.tsx') && !filePath.includes('test'));
}

function isServiceFile(filePath: string): boolean {
  return filePath.includes('/services/') ||
         filePath.includes('/utils/') ||
         filePath.includes('/helpers/') ||
         filePath.includes('/lib/') ||
         filePath.includes('/core/') ||
         filePath.includes('/store/');
}

function isConfigFile(filePath: string, fileName: string): boolean {
  const configFiles = [
    'package.json', 'tsconfig.json', 'webpack.config.js', 'vite.config.js',
    'next.config.js', 'tailwind.config.js', 'jest.config.js', 'dockerfile',
    'docker-compose.yml', '.env', 'requirements.txt', 'cargo.toml', 'go.mod'
  ];
  
  return configFiles.some(config => fileName.toLowerCase().includes(config.toLowerCase())) ||
         filePath.includes('/config/');
}

function isDocumentationWithCode(content: string, extension: string): boolean {
  if (!extension.match(/\.(md|mdx|rst|txt)$/)) return false;
  
  // Check if documentation contains code blocks
  return content.includes('```') || 
         content.includes('    ') && content.includes('function') ||
         content.includes('const ') ||
         content.includes('class ');
}

function isDatabaseFile(filePath: string): boolean {
  return filePath.includes('/schema/') ||
         filePath.includes('/models/') ||
         filePath.includes('/database/') ||
         filePath.includes('/migrations/') ||
         filePath.includes('/prisma/') ||
         filePath.endsWith('.sql') ||
         filePath.includes('db/');
}

function isMiddlewareFile(filePath: string): boolean {
  return filePath.includes('/middleware/') ||
         filePath.includes('/auth/') ||
         filePath.includes('middleware.') ||
         filePath.includes('/guards/');
}

function isHookOrCustomLogic(filePath: string): boolean {
  return filePath.includes('/hooks/') ||
         filePath.includes('/custom/') ||
         filePath.includes('/composables/') ||
         filePath.startsWith('use') ||
         filePath.includes('/providers/');
}

function isTestFile(filePath: string): boolean {
  return filePath.includes('/test/') ||
         filePath.includes('/tests/') ||
         filePath.includes('/__tests__/') ||
         filePath.includes('.test.') ||
         filePath.includes('.spec.') ||
         filePath.endsWith('.test.ts') ||
         filePath.endsWith('.spec.ts');
}

function isGeneratedFile(filePath: string): boolean {
  return filePath.includes('/generated/') ||
         filePath.includes('/.next/') ||
         filePath.includes('/dist/') ||
         filePath.includes('/build/') ||
         filePath.includes('/out/') ||
         filePath.includes('.generated.') ||
         filePath.endsWith('.d.ts') && filePath.includes('node_modules');
}

function isInImportantDirectory(filePath: string): boolean {
  const importantDirs = ['/src/', '/app/', '/lib/', '/components/', '/pages/', '/api/'];
  return importantDirs.some(dir => filePath.includes(dir));
}

function isGitOrDeploymentFile(filePath: string): boolean {
  return filePath.includes('/.github/') ||
         filePath.includes('/deploy/') ||
         filePath.includes('ci.yml') ||
         filePath.includes('cd.yml') ||
         filePath.includes('workflow') ||
         filePath.includes('dockerfile');
}

function isProjectManagementFile(filePath: string, content: string): boolean {
  const fileName = filePath.split('/').pop()?.toLowerCase() || '';
  
  return fileName.includes('todo') ||
         fileName.includes('roadmap') ||
         fileName.includes('milestone') ||
         fileName.includes('changelog') ||
         content.toLowerCase().includes('- [ ]') || // Task lists
         content.toLowerCase().includes('milestone') ||
         content.toLowerCase().includes('deadline');
}

// Content analysis helpers

function hasApiCalls(content: string): boolean {
  return content.includes('fetch(') ||
         content.includes('axios.') ||
         content.includes('http.') ||
         content.includes('api.') ||
         content.includes('useQuery') ||
         content.includes('useMutation') ||
         content.includes('/api/');
}

function hasStateManagement(content: string): boolean {
  return content.includes('useState') ||
         content.includes('useReducer') ||
         content.includes('useStore') ||
         content.includes('createStore') ||
         content.includes('dispatch') ||
         content.includes('redux') ||
         content.includes('zustand');
}

function hasClassDefinitions(content: string): boolean {
  return content.includes('class ') ||
         content.includes('interface ') ||
         content.includes('extends ') ||
         content.includes('implements ');
}

function hasTypeDefinitions(content: string): boolean {
  return content.includes('type ') ||
         content.includes('interface ') ||
         content.includes('enum ') ||
         content.includes(': {') ||
         content.includes('Record<');
}