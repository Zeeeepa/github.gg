import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '@/lib/trpc/trpc';
import { lynlangService } from '@/lib/services/lynlang';
import { TRPCError } from '@trpc/server';
import path from 'path';
import { promises as fs } from 'fs';

// Enhanced schema for comprehensive lynlang analysis
const ComprehensiveLynlangAnalysisSchema = z.object({
  success: z.boolean(),
  analysisType: z.enum(['file', 'content', 'directory', 'ast', 'patterns', 'metrics']),
  timestamp: z.string(),
  
  // Core analysis data
  ast: z.any().optional(),
  patterns: z.array(z.object({
    type: z.string(),
    location: z.object({
      line: z.number(),
      column: z.number(),
      file: z.string()
    }),
    description: z.string(),
    confidence: z.number(),
    severity: z.enum(['info', 'warning', 'error']).optional(),
    suggestion: z.string().optional()
  })).optional(),
  
  // Error handling
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  
  // Enhanced metrics
  metrics: z.object({
    linesOfCode: z.number(),
    complexity: z.object({
      cyclomatic: z.number(),
      cognitive: z.number(),
      halstead: z.object({
        vocabulary: z.number(),
        length: z.number(),
        difficulty: z.number(),
        effort: z.number()
      }).optional()
    }),
    dependencies: z.object({
      internal: z.number(),
      external: z.number(),
      circular: z.array(z.string())
    }),
    quality: z.object({
      maintainability: z.number(),
      testability: z.number(),
      documentation: z.number()
    }).optional(),
    security: z.object({
      vulnerabilities: z.array(z.object({
        type: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        line: z.number().optional()
      }))
    }).optional()
  }).optional(),
  
  // Structure analysis
  structure: z.object({
    functions: z.array(z.object({
      name: z.string(),
      line: z.number(),
      complexity: z.number(),
      parameters: z.number(),
      returns: z.string().optional()
    })),
    classes: z.array(z.object({
      name: z.string(),
      line: z.number(),
      methods: z.number(),
      properties: z.number()
    })),
    imports: z.array(z.object({
      module: z.string(),
      type: z.enum(['local', 'external', 'standard']),
      line: z.number()
    })),
    exports: z.array(z.object({
      name: z.string(),
      type: z.string(),
      line: z.number()
    }))
  }).optional(),
  
  // Context information
  context: z.object({
    filePath: z.string().optional(),
    language: z.string(),
    fileSize: z.number().optional(),
    executionTime: z.number() // in milliseconds
  })
});

export type ComprehensiveLynlangAnalysis = z.infer<typeof ComprehensiveLynlangAnalysisSchema>;

export const lynlangRouter = router({
  // Health check for lynlang service
  isAvailable: publicProcedure
    .query(async () => {
      try {
        const available = await lynlangService.isAvailable();
        return {
          available,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    }),

  // Comprehensive file analysis
  analyzeFile: protectedProcedure
    .input(z.object({
      filePath: z.string().describe('Absolute path to file for analysis'),
      analysisOptions: z.object({
        includeAST: z.boolean().default(true),
        includePatterns: z.boolean().default(true),
        includeMetrics: z.boolean().default(true),
        includeStructure: z.boolean().default(true),
        includeSecurity: z.boolean().default(true),
        patterns: z.array(z.string()).optional(),
        timeout: z.number().min(1000).max(120000).default(30000)
      }).default({
        includeAST: true,
        includePatterns: true,
        includeMetrics: true,
        includeStructure: true,
        includeSecurity: true,
        timeout: 30000
      })
    }))
    .mutation(async ({ input }) => {
      const startTime = Date.now();
      
      try {
        // Verify file exists and is accessible
        const stats = await fs.stat(input.filePath);
        if (!stats.isFile()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Path does not point to a file'
          });
        }

        // Get basic file info
        const language = path.extname(input.filePath).slice(1) || 'unknown';
        
        // Perform comprehensive analysis
        const baseAnalysis = await lynlangService.analyzeFile(input.filePath, {
          timeoutMs: input.analysisOptions.timeout
        });

        let ast: Record<string, unknown> | undefined = undefined;
        let patterns: unknown = undefined;
        const structureInfo: unknown = undefined;

        // Enhanced analysis based on options
        if (input.analysisOptions.includeAST && baseAnalysis.success) {
          try {
            ast = await lynlangService.generateAST(input.filePath);
          } catch (astError) {
            console.warn('AST generation failed:', astError);
          }
        }

        if (input.analysisOptions.includePatterns && input.analysisOptions.patterns?.length) {
          try {
            patterns = await lynlangService.findPatterns(
              input.filePath, 
              input.analysisOptions.patterns
            );
          } catch (patternError) {
            console.warn('Pattern matching failed:', patternError);
          }
        }

        // Build comprehensive result
        const result: ComprehensiveLynlangAnalysis = {
          success: baseAnalysis.success,
          analysisType: 'file',
          timestamp: new Date().toISOString(),
          ast,
          patterns: baseAnalysis.patterns || patterns?.flatMap((p: any) => 
            p.matches.map((m: any) => ({
              type: p.pattern,
              location: {
                line: m.line,
                column: m.column,
                file: input.filePath
              },
              description: `Pattern '${p.pattern}' found`,
              confidence: 0.9
            }))
          ),
          errors: baseAnalysis.errors,
          warnings: baseAnalysis.warnings,
          metrics: baseAnalysis.metrics ? {
            linesOfCode: baseAnalysis.metrics.linesOfCode,
            complexity: {
              cyclomatic: baseAnalysis.metrics.complexity,
              cognitive: baseAnalysis.metrics.complexity * 1.2, // Estimated
              halstead: ast ? {
                vocabulary: Object.keys(ast).length,
                length: JSON.stringify(ast).length,
                difficulty: baseAnalysis.metrics.complexity / 2,
                effort: baseAnalysis.metrics.complexity * 100
              } : undefined
            },
            dependencies: {
              internal: baseAnalysis.metrics.dependencies,
              external: 0, // Will be enhanced later
              circular: []
            },
            quality: {
              maintainability: Math.max(0, 100 - baseAnalysis.metrics.complexity * 5),
              testability: Math.max(0, 100 - baseAnalysis.metrics.complexity * 3),
              documentation: 50 // Placeholder
            },
            security: {
              vulnerabilities: [] // Will be enhanced with actual security analysis
            }
          } : undefined,
          structure: structureInfo,
          context: {
            filePath: input.filePath,
            language,
            fileSize: stats.size,
            executionTime: Date.now() - startTime
          }
        };

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `File analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }),

  // Comprehensive content analysis (for code snippets)
  analyzeContent: protectedProcedure
    .input(z.object({
      content: z.string().min(1).describe('Code content to analyze'),
      language: z.string().default('zen').describe('Programming language'),
      filename: z.string().optional().describe('Virtual filename for context'),
      analysisOptions: z.object({
        includeAST: z.boolean().default(true),
        includePatterns: z.boolean().default(true),
        includeMetrics: z.boolean().default(true),
        patterns: z.array(z.string()).optional(),
        timeout: z.number().min(1000).max(60000).default(15000)
      }).default({
        includeAST: true,
        includePatterns: true,
        includeMetrics: true,
        timeout: 15000
      })
    }))
    .mutation(async ({ input }) => {
      const startTime = Date.now();
      
      try {
        const fileExtension = input.language === 'zen' ? '.zen' : 
                            input.language === 'typescript' ? '.ts' :
                            input.language === 'javascript' ? '.js' :
                            input.language === 'python' ? '.py' :
                            input.language === 'rust' ? '.rs' : '.txt';

        // Perform analysis on content
        const baseAnalysis = await lynlangService.analyzeContent(
          input.content, 
          fileExtension,
          { timeoutMs: input.analysisOptions.timeout }
        );

        // Build comprehensive result for content analysis
        const result: ComprehensiveLynlangAnalysis = {
          success: baseAnalysis.success,
          analysisType: 'content',
          timestamp: new Date().toISOString(),
          patterns: baseAnalysis.patterns,
          errors: baseAnalysis.errors,
          warnings: baseAnalysis.warnings,
          metrics: baseAnalysis.metrics ? {
            linesOfCode: baseAnalysis.metrics.linesOfCode,
            complexity: {
              cyclomatic: baseAnalysis.metrics.complexity,
              cognitive: baseAnalysis.metrics.complexity * 1.2
            },
            dependencies: {
              internal: baseAnalysis.metrics.dependencies,
              external: 0,
              circular: []
            }
          } : undefined,
          context: {
            language: input.language,
            fileSize: Buffer.from(input.content, 'utf8').length,
            executionTime: Date.now() - startTime,
            filePath: input.filename
          }
        };

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }),

  // Directory analysis for comprehensive project insights
  analyzeDirectory: protectedProcedure
    .input(z.object({
      directoryPath: z.string().describe('Path to directory for analysis'),
      options: z.object({
        recursive: z.boolean().default(true),
        fileExtensions: z.array(z.string()).default(['zen', 'ts', 'js', 'py', 'rs']),
        excludePatterns: z.array(z.string()).default(['node_modules', '.git', 'dist', 'build']),
        maxFiles: z.number().min(1).max(1000).default(100),
        timeout: z.number().min(5000).max(300000).default(60000)
      }).default({
        recursive: true,
        fileExtensions: ['zen', 'ts', 'js', 'py', 'rs'],
        excludePatterns: ['node_modules', '.git', 'dist', 'build'],
        maxFiles: 100,
        timeout: 60000
      })
    }))
    .mutation(async ({ input }) => {
      const startTime = Date.now();
      
      try {
        // Verify directory exists
        const stats = await fs.stat(input.directoryPath);
        if (!stats.isDirectory()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Path does not point to a directory'
          });
        }

        // Perform directory analysis
        const analysis = await lynlangService.analyzeDirectory(input.directoryPath, {
          recursive: input.options.recursive,
          fileExtensions: input.options.fileExtensions,
          excludePatterns: input.options.excludePatterns,
          timeoutMs: input.options.timeout
        });

        const result: ComprehensiveLynlangAnalysis = {
          success: analysis.success,
          analysisType: 'directory',
          timestamp: new Date().toISOString(),
          ast: analysis.ast,
          patterns: analysis.patterns,
          errors: analysis.errors,
          warnings: analysis.warnings,
          metrics: analysis.metrics ? {
            linesOfCode: analysis.metrics.linesOfCode,
            complexity: {
              cyclomatic: analysis.metrics.complexity,
              cognitive: analysis.metrics.complexity * 1.3
            },
            dependencies: {
              internal: analysis.metrics.dependencies,
              external: 0, // Enhanced later
              circular: []
            }
          } : undefined,
          context: {
            filePath: input.directoryPath,
            language: 'mixed',
            executionTime: Date.now() - startTime
          }
        };

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Directory analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }),

  // Pattern matching across files
  findPatterns: protectedProcedure
    .input(z.object({
      filePath: z.string().describe('File path to search patterns in'),
      patterns: z.array(z.string()).min(1).describe('Array of patterns to search for'),
      options: z.object({
        timeout: z.number().min(1000).max(30000).default(10000)
      }).default({ timeout: 10000 })
    }))
    .mutation(async ({ input }) => {
      try {
        const results = await lynlangService.findPatterns(
          input.filePath,
          input.patterns,
          { timeoutMs: input.options.timeout }
        );

        return {
          success: true,
          timestamp: new Date().toISOString(),
          filePath: input.filePath,
          patterns: input.patterns,
          results
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Pattern search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }),

  // AST generation with enhanced capabilities
  generateAST: protectedProcedure
    .input(z.object({
      filePath: z.string().describe('File path to generate AST for'),
      options: z.object({
        includeComments: z.boolean().default(true),
        includeLocations: z.boolean().default(true),
        timeout: z.number().min(1000).max(30000).default(15000)
      }).default({
        includeComments: true,
        includeLocations: true,
        timeout: 15000
      })
    }))
    .mutation(async ({ input }) => {
      try {
        const ast = await lynlangService.generateAST(input.filePath, {
          timeoutMs: input.options.timeout
        });

        return {
          success: true,
          timestamp: new Date().toISOString(),
          filePath: input.filePath,
          ast,
          options: input.options
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `AST generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }),

  // Batch analysis for multiple files
  batchAnalyze: protectedProcedure
    .input(z.object({
      filePaths: z.array(z.string()).min(1).max(50).describe('Array of file paths to analyze'),
      analysisOptions: z.object({
        includeAST: z.boolean().default(false), // Disabled by default for performance
        includePatterns: z.boolean().default(true),
        includeMetrics: z.boolean().default(true),
        timeout: z.number().min(5000).max(180000).default(60000)
      }).default({
        includeAST: false,
        includePatterns: true,
        includeMetrics: true,
        timeout: 60000
      })
    }))
    .mutation(async ({ input }) => {
      const startTime = Date.now();
      const results: Array<{ filePath: string; analysis: ComprehensiveLynlangAnalysis | null; error?: string }> = [];

      try {
        // Process files sequentially to avoid overwhelming the system
        for (const filePath of input.filePaths) {
          try {
            const analysis = await lynlangService.analyzeFile(filePath, {
              timeoutMs: Math.floor(input.analysisOptions.timeout / input.filePaths.length)
            });

            const stats = await fs.stat(filePath);
            const language = path.extname(filePath).slice(1) || 'unknown';

            const result: ComprehensiveLynlangAnalysis = {
              success: analysis.success,
              analysisType: 'file',
              timestamp: new Date().toISOString(),
              patterns: analysis.patterns,
              errors: analysis.errors,
              warnings: analysis.warnings,
              metrics: analysis.metrics ? {
                linesOfCode: analysis.metrics.linesOfCode,
                complexity: {
                  cyclomatic: analysis.metrics.complexity,
                  cognitive: analysis.metrics.complexity * 1.2
                },
                dependencies: {
                  internal: analysis.metrics.dependencies,
                  external: 0,
                  circular: []
                }
              } : undefined,
              context: {
                filePath,
                language,
                fileSize: stats.size,
                executionTime: Date.now() - startTime
              }
            };

            results.push({ filePath, analysis: result });
          } catch (fileError) {
            results.push({ 
              filePath, 
              analysis: null, 
              error: fileError instanceof Error ? fileError.message : 'Unknown error' 
            });
          }
        }

        return {
          success: true,
          timestamp: new Date().toISOString(),
          totalFiles: input.filePaths.length,
          successfulAnalyses: results.filter(r => r.analysis?.success).length,
          results,
          executionTime: Date.now() - startTime
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Batch analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    })
});

export type LynlangRouter = typeof lynlangRouter;