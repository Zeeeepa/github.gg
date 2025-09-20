import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

// Schema for lynlang analysis results
const LynlangAnalysisSchema = z.object({
  success: z.boolean(),
  ast: z.any().optional(),
  patterns: z.array(z.object({
    type: z.string(),
    location: z.object({
      line: z.number(),
      column: z.number(),
      file: z.string()
    }),
    description: z.string(),
    confidence: z.number()
  })).optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  metrics: z.object({
    linesOfCode: z.number(),
    complexity: z.number(),
    dependencies: z.number()
  }).optional()
});

export type LynlangAnalysis = z.infer<typeof LynlangAnalysisSchema>;

export interface LynlangExecutorOptions {
  timeoutMs?: number;
  maxOutputSize?: number;
  workingDirectory?: string;
}

export class LynlangService {
  private lynlangPath: string;
  private defaultOptions: LynlangExecutorOptions;

  constructor(lynlangPath: string = 'lynlang', options: LynlangExecutorOptions = {}) {
    this.lynlangPath = lynlangPath;
    this.defaultOptions = {
      timeoutMs: 30000,
      maxOutputSize: 1024 * 1024, // 1MB
      workingDirectory: process.cwd(),
      ...options
    };
  }

  /**
   * Execute lynlang binary with given arguments
   */
  private async executeLynlang(
    args: string[],
    options: LynlangExecutorOptions = {}
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const opts = { ...this.defaultOptions, ...options };
    
    return new Promise((resolve, reject) => {
      const child = spawn(this.lynlangPath, args, {
        cwd: opts.workingDirectory,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: opts.timeoutMs
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (stdout.length > opts.maxOutputSize!) {
          child.kill('SIGTERM');
          reject(new Error('Output size exceeded maximum limit'));
        }
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (stderr.length > opts.maxOutputSize!) {
          child.kill('SIGTERM');
          reject(new Error('Error output size exceeded maximum limit'));
        }
      });

      child.on('close', (code) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0
        });
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to execute lynlang: ${error.message}`));
      });

      // Set timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Lynlang execution timed out after ${opts.timeoutMs}ms`));
      }, opts.timeoutMs);
    });
  }

  /**
   * Check if lynlang binary is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result = await this.executeLynlang(['--version'], { timeoutMs: 5000 });
      return result.exitCode === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Analyze a single file with lynlang
   */
  async analyzeFile(filePath: string, options: LynlangExecutorOptions = {}): Promise<LynlangAnalysis> {
    try {
      // Check if file exists
      await fs.access(filePath);
      
      const args = ['analyze', '--json', filePath];
      const result = await this.executeLynlang(args, options);
      
      if (result.exitCode !== 0) {
        return {
          success: false,
          errors: [result.stderr || 'Unknown error occurred'],
        };
      }

      // Parse JSON output
      try {
        const parsed = JSON.parse(result.stdout);
        return LynlangAnalysisSchema.parse({
          success: true,
          ...parsed
        });
      } catch (parseError) {
        return {
          success: false,
          errors: [`Failed to parse lynlang output: ${parseError}`],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [`File analysis failed: ${error}`],
      };
    }
  }

  /**
   * Analyze multiple files or directory
   */
  async analyzeDirectory(
    directoryPath: string, 
    options: LynlangExecutorOptions & { 
      recursive?: boolean;
      fileExtensions?: string[];
      excludePatterns?: string[];
    } = {}
  ): Promise<LynlangAnalysis> {
    try {
      const args = ['analyze', '--json'];
      
      if (options.recursive) {
        args.push('--recursive');
      }
      
      if (options.fileExtensions?.length) {
        args.push('--extensions', options.fileExtensions.join(','));
      }
      
      if (options.excludePatterns?.length) {
        args.push('--exclude', options.excludePatterns.join(','));
      }
      
      args.push(directoryPath);
      
      const result = await this.executeLynlang(args, options);
      
      if (result.exitCode !== 0) {
        return {
          success: false,
          errors: [result.stderr || 'Unknown error occurred'],
        };
      }

      try {
        const parsed = JSON.parse(result.stdout);
        return LynlangAnalysisSchema.parse({
          success: true,
          ...parsed
        });
      } catch (parseError) {
        return {
          success: false,
          errors: [`Failed to parse lynlang output: ${parseError}`],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Directory analysis failed: ${error}`],
      };
    }
  }

  /**
   * Generate AST for a file
   */
  async generateAST(filePath: string, options: LynlangExecutorOptions = {}): Promise<any> {
    try {
      const args = ['ast', '--json', filePath];
      const result = await this.executeLynlang(args, options);
      
      if (result.exitCode !== 0) {
        throw new Error(result.stderr || 'Failed to generate AST');
      }

      return JSON.parse(result.stdout);
    } catch (error) {
      throw new Error(`AST generation failed: ${error}`);
    }
  }

  /**
   * Perform pattern matching on code
   */
  async findPatterns(
    filePath: string,
    patterns: string[],
    options: LynlangExecutorOptions = {}
  ): Promise<Array<{
    pattern: string;
    matches: Array<{
      line: number;
      column: number;
      context: string;
    }>;
  }>> {
    try {
      const args = ['pattern-match', '--json'];
      patterns.forEach(pattern => {
        args.push('--pattern', pattern);
      });
      args.push(filePath);

      const result = await this.executeLynlang(args, options);
      
      if (result.exitCode !== 0) {
        throw new Error(result.stderr || 'Pattern matching failed');
      }

      return JSON.parse(result.stdout);
    } catch (error) {
      throw new Error(`Pattern matching failed: ${error}`);
    }
  }

  /**
   * Create a temporary file for analysis
   */
  private async createTempFile(content: string, extension: string = '.zen'): Promise<string> {
    const tempDir = await fs.mkdtemp(path.join(process.cwd(), 'temp-lynlang-'));
    const tempFile = path.join(tempDir, `analysis${extension}`);
    await fs.writeFile(tempFile, content, 'utf-8');
    return tempFile;
  }

  /**
   * Analyze code content directly (without file)
   */
  async analyzeContent(
    content: string,
    fileExtension: string = '.zen',
    options: LynlangExecutorOptions = {}
  ): Promise<LynlangAnalysis> {
    let tempFile: string | null = null;
    
    try {
      tempFile = await this.createTempFile(content, fileExtension);
      return await this.analyzeFile(tempFile, options);
    } finally {
      // Clean up temp file
      if (tempFile) {
        try {
          await fs.unlink(tempFile);
          await fs.rmdir(path.dirname(tempFile));
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file:', cleanupError);
        }
      }
    }
  }
}

// Create a default instance
export const lynlangService = new LynlangService();

// Export types and schemas
export { LynlangAnalysisSchema };
export type { LynlangExecutorOptions };