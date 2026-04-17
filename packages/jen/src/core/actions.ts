import { jen } from './cache-revalidation.js';

/**
 * Server Action Metadata
 */
export interface ActionMetadata {
  id: string; // Unique identifier for the action
  filePath: string;
  exportName: string;
}

/**
 * Registry for Server Actions
 */
export class ActionRegistry {
  private static actions = new Map<string, Function>();

  /**
   * Register an action
   */
  public static register(id: string, action: Function): void {
    this.actions.set(id, action);
  }

  /**
   * Get an action by ID
   */
  public static get(id: string): Function | undefined {
    return this.actions.get(id);
  }

  /**
   * Generate an action ID from file path and export name
   */
  public static generateId(filePath: string, exportName: string): string {
    // Simple hash or base64 of the path and name
    return Buffer.from(`${filePath}:${exportName}`).toString('base64');
  }
}

/**
 * Result of a server action
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  revalidatedPaths?: string[];
}

/**
 * Base class/wrapper for executing actions and handling revalidation
 */
export async function executeAction<T>(
  actionId: string,
  args: any[]
): Promise<ActionResult<T>> {
  const action = ActionRegistry.get(actionId);
  if (!action) {
    return { success: false, error: `Action ${actionId} not found` };
  }

  try {
    const result = await action(...args);
    
    // Actions can return an object with data and revalidate paths
    // or just the data.
    if (result && typeof result === 'object' && ('revalidate' in result || 'revalidatePath' in result)) {
        const paths = Array.isArray(result.revalidate) ? result.revalidate : [result.revalidate];
        for (const path of paths) {
            if (path) await jen.revalidate(path);
        }
    }

    return {
      success: true,
      data: result?.data ?? result,
      revalidatedPaths: result?.revalidate ? (Array.isArray(result.revalidate) ? result.revalidate : [result.revalidate]) : []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
