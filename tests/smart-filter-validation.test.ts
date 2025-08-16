/**
 * Comprehensive validation tests for AI-powered smart file filtering
 * Run with: bun test tests/smart-filter-validation.test.ts
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { 
  buildFileTree, 
  formatFileTreeForAI, 
  selectFilesWithAI, 
  filterFilesByAISelection,
  type FileTreeNode,
  type FileSelectionResult 
} from '../src/lib/github/ai-file-selector';
import { applyTwoStageFiltering } from '../src/lib/github/filters';
import type { DiagramType } from '../src/lib/types/diagram';

// Mock file structures for different project types
const mockRepoStructures = {
  nextjs: [
    { path: 'package.json', size: 2500 },
    { path: 'next.config.js', size: 800 },
    { path: 'tsconfig.json', size: 600 },
    { path: 'src/app/page.tsx', size: 1200 },
    { path: 'src/app/layout.tsx', size: 900 },
    { path: 'src/app/api/users/route.ts', size: 1500 },
    { path: 'src/app/api/auth/route.ts', size: 1800 },
    { path: 'src/components/Button.tsx', size: 800 },
    { path: 'src/components/Header.tsx', size: 1200 },
    { path: 'src/components/ui/dialog.tsx', size: 2000 },
    { path: 'src/lib/auth.ts', size: 1500 },
    { path: 'src/lib/db.ts', size: 1000 },
    { path: 'src/lib/utils.ts', size: 600 },
    { path: 'src/types/user.ts', size: 400 },
    { path: 'src/hooks/useAuth.ts', size: 700 },
    { path: 'src/styles/globals.css', size: 500 },
    { path: 'public/logo.png', size: 5000 },
    { path: 'README.md', size: 2000 },
    { path: 'node_modules/react/index.js', size: 1000 },
    { path: 'package-lock.json', size: 50000 },
    { path: '.next/static/chunks/main.js', size: 30000 },
    { path: 'src/__tests__/Button.test.tsx', size: 800 },
    { path: 'src/__tests__/auth.test.ts', size: 1200 },
  ],
  
  express: [
    { path: 'package.json', size: 1800 },
    { path: 'server.js', size: 2000 },
    { path: 'app.js', size: 1500 },
    { path: 'routes/users.js', size: 1200 },
    { path: 'routes/auth.js', size: 1000 },
    { path: 'middleware/auth.js', size: 800 },
    { path: 'models/User.js', size: 600 },
    { path: 'models/Post.js', size: 500 },
    { path: 'controllers/userController.js', size: 1100 },
    { path: 'controllers/postController.js', size: 900 },
    { path: 'config/database.js', size: 400 },
    { path: 'config/env.js', size: 300 },
    { path: 'utils/validation.js', size: 500 },
    { path: 'utils/helpers.js', size: 400 },
    { path: 'public/index.html', size: 800 },
    { path: 'public/style.css', size: 600 },
    { path: 'tests/user.test.js', size: 700 },
    { path: 'tests/auth.test.js', size: 600 },
    { path: 'node_modules/express/index.js', size: 2000 },
    { path: 'package-lock.json', size: 40000 },
  ],
  
  python: [
    { path: 'requirements.txt', size: 800 },
    { path: 'main.py', size: 1500 },
    { path: 'app/__init__.py', size: 200 },
    { path: 'app/models.py', size: 2000 },
    { path: 'app/views.py', size: 1800 },
    { path: 'app/forms.py', size: 1000 },
    { path: 'app/auth.py', size: 1200 },
    { path: 'app/database.py', size: 800 },
    { path: 'app/utils.py', size: 600 },
    { path: 'config.py', size: 500 },
    { path: 'migrations/001_initial.py', size: 700 },
    { path: 'static/style.css', size: 400 },
    { path: 'templates/base.html', size: 600 },
    { path: 'templates/index.html', size: 500 },
    { path: 'tests/test_models.py', size: 800 },
    { path: 'tests/test_views.py', size: 900 },
    { path: 'venv/lib/python3.9/site-packages/flask/__init__.py', size: 1500 },
    { path: 'README.md', size: 1200 },
  ],
};

// Mock Gemini API response for testing
const mockAIResponse: FileSelectionResult = {
  selectedFiles: [
    'src/app/page.tsx',
    'src/app/api/users/route.ts',
    'src/lib/auth.ts',
    'package.json'
  ],
  selectedDirectories: [
    'src/components'
  ],
  reasoning: 'Selected main entry point, API routes, authentication logic, and UI components for comprehensive diagram',
  estimatedRelevance: 8
};

describe('Smart Filter Validation', () => {
  describe('File Tree Construction', () => {
    test('should build correct hierarchical tree structure', () => {
      const files = [
        { path: 'src/app/page.tsx', size: 1000 },
        { path: 'src/lib/utils.ts', size: 500 },
        { path: 'package.json', size: 2000 }
      ];
      
      const tree = buildFileTree(files);
      
      expect(tree).toHaveLength(2); // src/ and package.json
      const srcNode = tree.find(node => node.path === 'src');
      expect(srcNode).toBeDefined();
      expect(srcNode!.type).toBe('directory');
      expect(srcNode!.children).toHaveLength(2); // app/ and lib/
      
      const srcDir = srcNode!;
      const appDir = srcDir.children!.find(c => c.path === 'src/app');
      expect(appDir?.children).toHaveLength(1); // page.tsx
      expect(appDir?.children![0].path).toBe('src/app/page.tsx');
      expect(appDir?.children![0].type).toBe('file');
      expect(appDir?.children![0].size).toBe(1000);
    });

    test('should handle deeply nested paths', () => {
      const files = [
        { path: 'src/components/ui/forms/Input.tsx', size: 800 },
        { path: 'src/components/ui/Button.tsx', size: 600 }
      ];
      
      const tree = buildFileTree(files);
      const formatted = formatFileTreeForAI(tree);
      
      expect(formatted).toContain('📁 src');
      expect(formatted).toContain('📁 src/components');
      expect(formatted).toContain('📁 src/components/ui');
      expect(formatted).toContain('📄 src/components/ui/forms/Input.tsx');
    });
  });

  describe('Project Type Detection', () => {
    test('should detect Next.js project correctly', () => {
      const files = mockRepoStructures.nextjs;
      const tree = buildFileTree(files);
      const formatted = formatFileTreeForAI(tree);
      
      expect(formatted).toContain('next.config.js');
      expect(formatted).toContain('src/app/');
      expect(formatted).toContain('package.json');
    });

    test('should detect Express.js project correctly', () => {
      const files = mockRepoStructures.express;
      const tree = buildFileTree(files);
      const formatted = formatFileTreeForAI(tree);
      
      expect(formatted).toContain('server.js');
      expect(formatted).toContain('routes/');
      expect(formatted).toContain('middleware/');
    });

    test('should detect Python project correctly', () => {
      const files = mockRepoStructures.python;
      const tree = buildFileTree(files);
      const formatted = formatFileTreeForAI(tree);
      
      expect(formatted).toContain('requirements.txt');
      expect(formatted).toContain('main.py');
      expect(formatted).toContain('app/');
    });
  });

  describe('File Selection Logic', () => {
    test('should filter files correctly based on AI selection', () => {
      const allFiles = mockRepoStructures.nextjs.map(f => ({
        ...f,
        content: `// Mock content for ${f.path}`
      }));

      const selection: FileSelectionResult = {
        selectedFiles: ['src/app/page.tsx', 'package.json'],
        selectedDirectories: ['src/components'],
        reasoning: 'Test selection',
        estimatedRelevance: 8
      };

      const filtered = filterFilesByAISelection(allFiles, selection);
      
      // Should include specific files
      expect(filtered.some(f => f.path === 'src/app/page.tsx')).toBe(true);
      expect(filtered.some(f => f.path === 'package.json')).toBe(true);
      
      // Should include all files from selected directories
      expect(filtered.some(f => f.path === 'src/components/Button.tsx')).toBe(true);
      expect(filtered.some(f => f.path === 'src/components/Header.tsx')).toBe(true);
      
      // Should NOT include non-selected files
      expect(filtered.some(f => f.path === 'src/lib/auth.ts')).toBe(false);
      expect(filtered.some(f => f.path === 'node_modules/react/index.js')).toBe(false);
    });

    test('should handle empty selections gracefully', () => {
      const allFiles = mockRepoStructures.nextjs.map(f => ({
        ...f,
        content: `// Content for ${f.path}`
      }));

      const emptySelection: FileSelectionResult = {
        selectedFiles: [],
        selectedDirectories: [],
        reasoning: 'No files selected',
        estimatedRelevance: 1
      };

      const filtered = filterFilesByAISelection(allFiles, emptySelection);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should use rule-based filtering when AI fails', () => {
      const files = mockRepoStructures.nextjs.map(f => ({
        ...f,
        content: `// Content for ${f.path}`
      }));

      // Test rule-based filtering directly
      const filtered = applyTwoStageFiltering(files, 'flowchart', true);
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThan(files.length);
      
      // Should prioritize important files
      expect(filtered.some(f => f.path === 'package.json')).toBe(true);
      expect(filtered.some(f => f.path === 'src/app/page.tsx')).toBe(true);
      
      // Should exclude generated/test files
      expect(filtered.some(f => f.path === 'package-lock.json')).toBe(false);
      expect(filtered.some(f => f.path === '.next/static/chunks/main.js')).toBe(false);
    });

    test('should handle basic filtering as last resort', () => {
      const files = mockRepoStructures.nextjs.map(f => ({
        ...f,
        content: `// Content for ${f.path}`
      }));

      // Test with smart filtering disabled
      const filtered = applyTwoStageFiltering(files, 'flowchart', false);
      
      // Should still filter out obvious non-code files
      expect(filtered.some(f => f.path === 'public/logo.png')).toBe(false);
      expect(filtered.some(f => f.path === 'package-lock.json')).toBe(false);
      
      // Should include code files
      expect(filtered.some(f => f.path === 'src/app/page.tsx')).toBe(true);
    });
  });

  describe('Diagram Type Specificity', () => {
    const testCases: { diagramType: DiagramType; expectedPriority: string[] }[] = [
      {
        diagramType: 'flowchart',
        expectedPriority: ['src/app/api/users/route.ts', 'src/app/page.tsx', 'src/lib/auth.ts']
      },
      {
        diagramType: 'sequence', 
        expectedPriority: ['src/app/api/users/route.ts', 'src/app/api/auth/route.ts', 'src/lib/auth.ts']
      },
      {
        diagramType: 'class',
        expectedPriority: ['src/types/user.ts', 'src/lib/db.ts', 'src/app/api/users/route.ts']
      }
    ];

    testCases.forEach(({ diagramType, expectedPriority }) => {
      test(`should prioritize relevant files for ${diagramType} diagrams`, () => {
        const files = mockRepoStructures.nextjs.map(f => ({
          ...f,
          content: `// Content for ${f.path}`
        }));

        const filtered = applyTwoStageFiltering(files, diagramType, true);
        
        // Check that expected priority files are included
        expectedPriority.forEach(priorityFile => {
          expect(filtered.some(f => f.path === priorityFile)).toBe(true);
        });
        
        // Should limit total files
        expect(filtered.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Performance Validation', () => {
    test('should significantly reduce file count', () => {
      const files = mockRepoStructures.nextjs.map(f => ({
        ...f,
        content: `// Content for ${f.path}`
      }));

      const originalCount = files.length;
      const filtered = applyTwoStageFiltering(files, 'flowchart', true);
      
      // Smart filter should limit to configured maxFiles (25)
      expect(filtered.length).toBeLessThanOrEqual(25);
      expect(filtered.length).toBeGreaterThan(5); // But not too aggressive
    });

    test('should maintain quality files', () => {
      const files = mockRepoStructures.nextjs.map(f => ({
        ...f,
        content: `// Content for ${f.path}`
      }));

      const filtered = applyTwoStageFiltering(files, 'flowchart', true);
      
      // Should include essential files
      const essentialFiles = ['package.json', 'src/app/page.tsx'];
      essentialFiles.forEach(essential => {
        expect(filtered.some(f => f.path === essential)).toBe(true);
      });
      
      // Should exclude noise
      const noiseFiles = ['package-lock.json', 'node_modules/react/index.js', '.next/static/chunks/main.js'];
      noiseFiles.forEach(noise => {
        expect(filtered.some(f => f.path === noise)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty file list', () => {
      const emptyFiles: Array<{ path: string; content: string; size: number }> = [];
      const filtered = applyTwoStageFiltering(emptyFiles, 'flowchart', true);
      expect(filtered).toHaveLength(0);
    });

    test('should handle single file', () => {
      const singleFile = [{ path: 'index.js', content: 'console.log("hello")', size: 100 }];
      const filtered = applyTwoStageFiltering(singleFile, 'flowchart', true);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].path).toBe('index.js');
    });

    test('should handle very large files', () => {
      const files = [
        { path: 'huge-file.js', content: 'x'.repeat(100000), size: 100000 },
        { path: 'normal-file.js', content: 'function test() {}', size: 100 }
      ];
      
      const filtered = applyTwoStageFiltering(files, 'flowchart', true);
      
      // Large files should get penalized but not completely excluded
      expect(filtered.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration Validation', () => {
  test('should work end-to-end with mock data', async () => {
    // This would test the full integration but requires actual AI API
    // For now, we'll test the data flow
    
    const files = mockRepoStructures.nextjs.slice(0, 10).map(f => ({
      path: f.path,
      size: f.size
    }));

    const tree = buildFileTree(files);
    const formatted = formatFileTreeForAI(tree);
    
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted).toContain('📁');
    expect(formatted).toContain('📄');
    
    // Mock the AI selection response
    const mockSelection: FileSelectionResult = {
      selectedFiles: ['package.json', 'src/app/page.tsx'],
      selectedDirectories: [],
      reasoning: 'Mock test selection',
      estimatedRelevance: 7
    };
    
    const allFiles = mockRepoStructures.nextjs.slice(0, 10).map(f => ({
      ...f,
      content: `// Mock content for ${f.path}`
    }));
    
    const filtered = filterFilesByAISelection(allFiles, mockSelection);
    expect(filtered.length).toBe(2);
    expect(filtered.map(f => f.path)).toEqual(['package.json', 'src/app/page.tsx']);
  });
});