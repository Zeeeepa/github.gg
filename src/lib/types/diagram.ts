import { z } from 'zod';

// Shared diagram type definition
export const DIAGRAM_TYPE_VALUES = ['flowchart', 'sequence', 'class', 'state', 'pie', 'gantt', 'timeline'] as const;
export type DiagramType = typeof DIAGRAM_TYPE_VALUES[number];

// Zod schema for diagram types
export const diagramTypeSchema = z.enum(DIAGRAM_TYPE_VALUES);

// Diagram type options for UI
export const DIAGRAM_TYPES = [
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'class', label: 'Class Diagram' },
  { value: 'state', label: 'State Diagram' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'gantt', label: 'Gantt Chart' },
  { value: 'timeline', label: 'Timeline' },
] as const;

// Shared schema for common diagram fields
export const diagramBaseSchema = z.object({
  user: z.string(),
  repo: z.string(),
  ref: z.string().optional().default('main'),
  diagramType: diagramTypeSchema.default('flowchart'),
});

// Input schema for diagram generation (legacy - for client-side file transfer)
export const diagramInputSchema = z.object({
  user: z.string(),
  repo: z.string(),
  ref: z.string().optional().default('main'),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    size: z.number().optional(),
  })),
  diagramType: diagramTypeSchema.default('flowchart'),
  options: z.record(z.any()).optional(),
  // Retry context
  previousResult: z.string().optional(),
  lastError: z.string().optional(),
  isRetry: z.boolean().optional().default(false),
});

// New schema for server-side file fetching
export const diagramInputSchemaServer = z.object({
  owner: z.string(), // Renamed 'user' to 'owner' for clarity
  repo: z.string(),
  ref: z.string().optional().default('main'),
  path: z.string().optional(), // Add path for context
  diagramType: diagramTypeSchema.default('flowchart'),
  options: z.record(z.any()).optional(),
  // Smart filtering options
  enableSmartFilter: z.boolean().optional().default(true),
  useAIFileSelection: z.boolean().optional().default(true), // Use AI to select files
  maxFiles: z.number().min(10).max(200).optional(), // Override max files if needed
  // Retry context
  previousResult: z.string().optional(),
  lastError: z.string().optional(),
  isRetry: z.boolean().optional().default(false),
});

// Output schema for diagram generation
export const diagramOutputSchema = z.object({
  diagramCode: z.string(),
  format: z.string().default('mermaid'),
  diagramType: diagramTypeSchema,
  cached: z.boolean(),
  stale: z.boolean(),
  lastUpdated: z.date(),
}); 