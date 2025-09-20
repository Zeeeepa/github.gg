import { applySmartFilter, SmartFilterConfig, DEFAULT_SMART_FILTER_CONFIG } from './smart-filter';
import { DiagramType } from '@/lib/types/diagram';

// Legacy file filtering configuration (still used for initial filtering)
export const FILE_FILTER_CONFIG = {
  // A more organized and comprehensive allow-list for file extensions and names.
  allowList: {
    // Common Languages
    languages: [
      '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.rb', '.java', '.c', '.cpp', '.h', '.hpp', 
      '.cs', '.go', '.rs', '.swift', '.kt', '.scala', '.php', '.pl', '.sh', '.bash', '.zsh', 
      '.ps1', '.lua', '.groovy', '.r', '.dart', '.hs', '.erl', '.ex', '.exs',
      // Clojure
      '.clj', '.cljs', '.cljc', '.edn',
      // Nim
      '.nim',
      // OCaml
      '.ml', '.mli',
      // F#
      '.fs', '.fsi', '.fsx',
      // Julia
      '.jl',
      // Crystal
      '.cr',
      // Zig
      '.zig',
      // V
      '.v',
      // Fortran
      '.f90', '.f95', '.f03', '.f08', '.f', '.for',
      // Pascal
      '.pas',
      // Ada
      '.adb', '.ads',
      // Matlab/Octave
      '.m',
      // Assembly
      '.asm', '.s',
      // COBOL
      '.cob', '.cbl',
      // Racket/Scheme
      '.rkt', '.scm',
      // Tcl
      '.tcl',
      // Smalltalk
      '.st',
      // D
      '.d',
      // Objective-C
      '.m', '.mm'
    ],
    // Web & Frontend
    web: ['.html', '.htm', '.css', '.scss', '.sass', '.less', '.styl', '.vue', '.svelte'],
    // Config Files
    config: [
      '.json', '.xml', '.yml', '.yaml', '.toml', '.ini', '.env', '.properties', '.babelrc', 
      '.eslintrc', '.prettierrc', '.browserslistrc', '.gitattributes', '.gitignore', '.editorconfig', 
      'tsconfig.json', 'package.json', 'webpack.config.js', 'vite.config.js', 'next.config.js',
      'tailwind.config.js', 'postcss.config.js', 'jest.config.js', 'cypress.config.js',
      'playwright.config.js', '.npmrc', '.yarnrc'
    ],
    // Documentation & Data
    docs: ['.md', '.mdx', '.txt', '.rst', '.adoc', '.csv', '.tsv', '.sql', '.graphql', '.gql'],
    // Build & Infrastructure
    build: [
      'Dockerfile', 'docker-compose.yml', '.dockerignore', 'Makefile', 'CMakeLists.txt', 
      'pom.xml', 'build.gradle', 'Vagrantfile', '.tf', '.tfvars'
    ],
    // Exact filenames to always include
    exactNames: ['README', 'LICENSE', 'CONTRIBUTING', 'CHANGELOG', 'CODE_OF_CONDUCT']
  },

  // Deny-list for extensions that are often binary, generated, or not useful.
  deniedExtensions: new Set([
    // Images
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg',
    // Fonts
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    // Videos & Audio
    '.mp4', '.avi', '.mov', '.mp3', '.wav', '.flac',
    // Compiled/Binary
    '.exe', '.dll', '.so', '.a', '.o', '.class', '.pyc', '.wasm',
    // Archives
    '.zip', '.tar', '.gz', '.rar', '.7z',
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    // Other
    '.lock', '.log', '.tmp', '.cache', '.suo', '.ntvs_analysis.dat',
    '.pdb', '.db', '.sqlite', '.sqlite3'
  ]),

  // Deny-list for specific filenames that should always be excluded
  deniedFilenames: new Set([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.lock',
    'Gemfile.lock',
    'Cargo.lock',
    'go.sum',
    'poetry.lock',
    'Pipfile.lock',
    'requirements.txt.lock'
  ]),

  // Deny-list for paths. Any file within these directories will be skipped.
  deniedPaths: [
    'node_modules/', 'vendor/', 'dist/', 'build/', 'bin/', 'obj/', '.git/', 
    '.svn/', '.hg/', '.idea/', '.vscode/', '__pycache__/', 'target/', 'out/',
    '.next/', 'coverage/', '.nyc_output/', 'logs/', 'tmp/', 'temp/'
  ]
};

// Combine all allowed extensions into a single Set for fast lookups.
export const ALLOWED_EXTENSIONS = new Set([
  ...FILE_FILTER_CONFIG.allowList.languages,
  ...FILE_FILTER_CONFIG.allowList.web,
  ...FILE_FILTER_CONFIG.allowList.config,
  ...FILE_FILTER_CONFIG.allowList.docs
]);

export function shouldProcessFile(filePath: string, path?: string, topLevelDir?: string | null): boolean {
  const lowerFilePath = filePath.toLowerCase();
  const fileName = filePath.split('/').pop() || '';

  // 0. Filter by path if specified
  if (path) {
    // Strip tarball prefix using the provided topLevelDir
    let pathWithoutPrefix = filePath;
    if (topLevelDir && filePath.startsWith(topLevelDir + '/')) {
      pathWithoutPrefix = filePath.substring(topLevelDir.length + 1);
    }
    
    if (!pathWithoutPrefix.startsWith(path + '/') && pathWithoutPrefix !== path) {
      return false;
    }
  }

  // 1. Deny if it's in a denied directory.
  if (FILE_FILTER_CONFIG.deniedPaths.some(p => lowerFilePath.startsWith(p))) {
    return false;
  }

  // 2. Deny if it's a specifically denied filename.
  if (FILE_FILTER_CONFIG.deniedFilenames.has(fileName)) {
    return false;
  }

  // 3. Deny if it has a denied extension.
  const extension = (fileName.includes('.') ? '.' + fileName.split('.').pop() : '').toLowerCase();
  if (extension && FILE_FILTER_CONFIG.deniedExtensions.has(extension)) {
    return false;
  }
  
  // 4. Deny files that contain denied patterns in their name (e.g., package-lock.json)
  const deniedPatterns = ['.lock', '.log', '.tmp', '.cache'];
  if (deniedPatterns.some(pattern => lowerFilePath.includes(pattern))) {
    return false;
  }
  
  // 5. Deny minified files
  if (lowerFilePath.endsWith('.min.js') || lowerFilePath.endsWith('.min.css')) {
    return false;
  }

  // 6. Allow if it's an exact name match (e.g., README).
  if (FILE_FILTER_CONFIG.allowList.exactNames.includes(fileName)) {
    return true;
  }

  // 7. Allow if it has an allowed extension.
  if (extension && ALLOWED_EXTENSIONS.has(extension)) {
    return true;
  }

  // 8. Allow common config file patterns that don't have extensions.
  if (FILE_FILTER_CONFIG.allowList.build.includes(fileName) || fileName.endsWith('rc')) {
    return true;
  }

  return false;
}

/**
 * Smart filtering configuration by diagram type
 */
export const DIAGRAM_SMART_FILTER_CONFIGS: Record<DiagramType, SmartFilterConfig> = {
  flowchart: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 25,
    includeConfig: true,
    prioritizeCore: true,
  },
  sequence: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 20,
    includeConfig: true,
    prioritizeCore: true,
  },
  class: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 20,
    includeConfig: false,
    prioritizeCore: true,
  },
  state: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 20,
    includeConfig: true,
    prioritizeCore: true,
  },
  gitgraph: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 15,
    includeConfig: true,
    includeTests: false,
    prioritizeCore: false,
  },
  gantt: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 15,
    includeConfig: true,
    includeTests: false,
    prioritizeCore: false,
  },
  pie: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 20,
    includeConfig: true,
    prioritizeCore: true,
  },
  timeline: {
    ...DEFAULT_SMART_FILTER_CONFIG,
    maxFiles: 15,
    includeConfig: true,
    includeTests: false,
    prioritizeCore: false,
  },
};

/**
 * Two-stage filtering: basic filtering first, then smart filtering
 */
export function applyTwoStageFiltering(
  files: Array<{ path: string; content: string; size: number }>,
  diagramType: DiagramType = 'flowchart',
  enableSmartFilter: boolean = true
): Array<{ path: string; content: string; size: number; score?: number; reasons?: string[] }> {
  // Stage 1: Apply basic filtering (remove binary files, etc.)
  const basicFiltered = files.filter(file => 
    shouldProcessFile(file.path, undefined, null)
  );

  // Stage 2: Apply smart filtering if enabled
  if (!enableSmartFilter) {
    return basicFiltered;
  }

  const config = DIAGRAM_SMART_FILTER_CONFIGS[diagramType] || DEFAULT_SMART_FILTER_CONFIG;
  const smartFiltered = applySmartFilter(basicFiltered, {
    ...config,
    diagramType,
  });

  return smartFiltered;
}

/**
 * Get smart filter configuration for a specific diagram type
 */
export function getSmartFilterConfig(diagramType: DiagramType): SmartFilterConfig {
  return DIAGRAM_SMART_FILTER_CONFIGS[diagramType] || DEFAULT_SMART_FILTER_CONFIG;
}

// Re-export smart filter functions for convenience
export { applySmartFilter, type SmartFilterConfig, DEFAULT_SMART_FILTER_CONFIG }; 