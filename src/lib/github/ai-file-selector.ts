/**
 * AI-powered file selection for diagram generation
 * Analyzes file tree structure and selects most relevant files
 */

import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { DiagramType } from '@/lib/types/diagram';

export interface FileTreeNode {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
}

export interface FileSelectionResult {
  selectedFiles: string[];
  selectedDirectories: string[];
  reasoning: string;
  estimatedRelevance: number; // 1-10 scale
}

// Schema for AI response
const fileSelectionSchema = z.object({
  selectedFiles: z.array(z.string()).describe('Array of specific file paths that should be included'),
  selectedDirectories: z.array(z.string()).describe('Array of directory paths where ALL files should be included'),
  reasoning: z.string().describe('Brief explanation of why these files/directories were selected'),
  estimatedRelevance: z.number().min(1).max(10).describe('Confidence score for selection quality (1-10)')
});

/**
 * Converts flat file list to hierarchical tree structure
 */
export function buildFileTree(files: Array<{ path: string; size: number }>): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const nodeMap = new Map<string, FileTreeNode>();

  // Sort files by path to ensure proper hierarchy
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const pathParts = file.path.split('/');
    let currentPath = '';

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!nodeMap.has(currentPath)) {
        const isFile = i === pathParts.length - 1;
        const node: FileTreeNode = {
          path: currentPath,
          type: isFile ? 'file' : 'directory',
          size: isFile ? file.size : undefined,
          children: isFile ? undefined : []
        };
        
        nodeMap.set(currentPath, node);
        
        if (parentPath && nodeMap.has(parentPath)) {
          const parent = nodeMap.get(parentPath)!;
          if (parent.children) {
            parent.children.push(node);
          }
        } else {
          tree.push(node);
        }
      }
    }
  }

  return tree;
}

/**
 * Converts file tree to a compact string representation for AI
 */
export function formatFileTreeForAI(tree: FileTreeNode[], maxDepth: number = 10): string {
  function formatNode(node: FileTreeNode, depth: number = 0): string {
    if (depth > maxDepth) return '';
    
    const indent = '  '.repeat(depth);
    const sizeInfo = node.size ? ` (${formatFileSize(node.size)})` : '';
    const nodeStr = `${indent}${node.type === 'directory' ? '📁' : '📄'} ${node.path}${sizeInfo}\n`;
    
    if (node.children && node.children.length > 0) {
      const childrenStr = node.children
        .map(child => formatNode(child, depth + 1))
        .filter(str => str.length > 0)
        .join('');
      return nodeStr + childrenStr;
    }
    
    return nodeStr;
  }
  
  return tree.map(node => formatNode(node)).join('');
}

/**
 * Main function: AI analyzes file tree and selects relevant files
 */
export async function selectFilesWithAI(
  files: Array<{ path: string; size: number }>,
  diagramType: DiagramType,
  repoName: string,
  apiKey: string
): Promise<FileSelectionResult> {
  // Build hierarchical tree
  const fileTree = buildFileTree(files);
  const treeString = formatFileTreeForAI(fileTree);
  
  // Detect project characteristics
  const projectInfo = analyzeProjectType(files);
  
  const prompt = `You are an expert software architect analyzing a repository to select the most relevant files for generating a ${diagramType} diagram.

REPOSITORY: ${repoName}
DETECTED PROJECT TYPE: ${projectInfo.type}
MAIN LANGUAGE: ${projectInfo.language}
FRAMEWORK: ${projectInfo.framework}
TOTAL FILES: ${files.length}

FILE TREE STRUCTURE:
${treeString}

TASK: Select the minimum set of files and directories needed to create an accurate ${diagramType} diagram.

SELECTION GUIDELINES:
1. **Core Architecture Files**: Main entry points, route handlers, API endpoints
2. **Key Components**: Important UI components, services, utilities
3. **Configuration**: Package.json, config files that show dependencies/setup
4. **Database/Schema**: Models, migrations, schema files
5. **Type Definitions**: Important interfaces and types

DIAGRAM-SPECIFIC PRIORITIES:
${getDiagramSpecificGuidelines(diagramType)}

CONSTRAINTS:
- Maximum 30 individual files OR 5 directories
- Prioritize quality over quantity
- Avoid test files, generated files, node_modules
- If selecting a directory, ALL files in it will be included

RESPOND WITH:
- selectedFiles: Array of specific file paths (e.g., ["src/index.ts", "package.json"])
- selectedDirectories: Array of directory paths (e.g., ["src/api", "src/components"]) 
- reasoning: Brief explanation of your selection strategy
- estimatedRelevance: Confidence score 1-10 for diagram generation quality`;

  try {
    const result = await generateObject({
      model: google('models/gemini-2.5-pro', { apiKey }),
      schema: fileSelectionSchema,
      messages: [{ role: 'user', content: prompt }],
    });

    return result.object;
  } catch (error) {
    console.error('AI file selection failed:', error);
    // Fallback to simple heuristic selection
    return fallbackFileSelection(files);
  }
}

/**
 * Analyzes project type from file structure
 */
function analyzeProjectType(files: Array<{ path: string; size: number }>): {
  type: string;
  language: string;
  framework: string;
} {
  const paths = files.map(f => f.path.toLowerCase());
  
  // Detect language
  let language = 'Unknown';
  if (paths.some(p => p.endsWith('.ts') || p.endsWith('.tsx'))) language = 'TypeScript';
  else if (paths.some(p => p.endsWith('.js') || p.endsWith('.jsx'))) language = 'JavaScript';
  else if (paths.some(p => p.endsWith('.py'))) language = 'Python';
  else if (paths.some(p => p.endsWith('.java'))) language = 'Java';
  else if (paths.some(p => p.endsWith('.go'))) language = 'Go';
  else if (paths.some(p => p.endsWith('.rs'))) language = 'Rust';
  
  // Detect framework
  let framework = 'Unknown';
  if (paths.includes('next.config.js') || paths.includes('next.config.ts')) framework = 'Next.js';
  else if (paths.includes('vite.config.js') || paths.includes('vite.config.ts')) framework = 'Vite';
  else if (paths.includes('angular.json')) framework = 'Angular';
  else if (paths.includes('vue.config.js')) framework = 'Vue.js';
  else if (paths.includes('svelte.config.js')) framework = 'Svelte';
  else if (paths.includes('package.json')) framework = 'Node.js';
  else if (paths.includes('requirements.txt') || paths.includes('setup.py')) framework = 'Python';
  else if (paths.includes('cargo.toml')) framework = 'Rust';
  else if (paths.includes('go.mod')) framework = 'Go';
  
  // Detect project type
  let type = 'Application';
  if (paths.some(p => p.includes('api/') || p.includes('routes/'))) type = 'Web API';
  else if (paths.some(p => p.includes('components/') || p.includes('pages/'))) type = 'Web Frontend';
  else if (paths.includes('dockerfile') || paths.includes('docker-compose.yml')) type = 'Containerized App';
  else if (paths.some(p => p.includes('lambda') || p.includes('serverless'))) type = 'Serverless';
  
  return { type, language, framework };
}

/**
 * Diagram-specific selection guidelines
 */
function getDiagramSpecificGuidelines(diagramType: DiagramType): string {
  switch (diagramType) {
    case 'flowchart':
      return `
- Focus on data flow and business logic
- Include API endpoints, services, and main components
- Show how data moves through the system`;
      
    case 'sequence':
      return `
- Prioritize API routes, controllers, and service files
- Include authentication/middleware files
- Focus on request/response flow`;
      
    case 'class':
      return `
- Include type definitions, interfaces, and class files
- Focus on data models and entity relationships
- Include schema/database files`;
      
    case 'gantt':
      return `
- Look for project management files (README, TODO, CHANGELOG)
- Include configuration files showing project setup
- Focus on development workflow files`;
      
    default:
      return `
- Select files that best represent the system architecture
- Include core business logic and main entry points`;
  }
}

/**
 * Fallback selection when AI fails
 */
function fallbackFileSelection(
  files: Array<{ path: string; size: number }>
): FileSelectionResult {
  const selectedFiles: string[] = [];
  
  // Always include package.json if it exists
  if (files.some(f => f.path === 'package.json')) {
    selectedFiles.push('package.json');
  }
  
  // Include main entry points
  const entryPoints = files.filter(f => 
    f.path.includes('index.') || 
    f.path.includes('main.') || 
    f.path.includes('app.')
  ).slice(0, 3);
  selectedFiles.push(...entryPoints.map(f => f.path));
  
  // Include some API/route files
  const apiFiles = files.filter(f => 
    f.path.includes('/api/') || 
    f.path.includes('/routes/')
  ).slice(0, 5);
  selectedFiles.push(...apiFiles.map(f => f.path));
  
  return {
    selectedFiles: [...new Set(selectedFiles)], // Remove duplicates
    selectedDirectories: [],
    reasoning: 'Fallback selection using basic heuristics',
    estimatedRelevance: 5
  };
}

/**
 * Helper function to format file sizes
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/**
 * Filters original files based on AI selection
 */
export function filterFilesByAISelection(
  allFiles: Array<{ path: string; content: string; size: number }>,
  selection: FileSelectionResult
): Array<{ path: string; content: string; size: number }> {
  const selectedFiles = new Set<string>();
  
  // Add individually selected files
  selection.selectedFiles.forEach(filePath => {
    selectedFiles.add(filePath);
  });
  
  // Add all files from selected directories
  selection.selectedDirectories.forEach(dirPath => {
    allFiles.forEach(file => {
      if (file.path.startsWith(dirPath + '/') || file.path === dirPath) {
        selectedFiles.add(file.path);
      }
    });
  });
  
  // Return filtered files
  return allFiles.filter(file => selectedFiles.has(file.path));
}