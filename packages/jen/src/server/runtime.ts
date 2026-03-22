// src/server/RuntimeDetector.ts
import { RuntimeEnvironment } from '../types';

export class RuntimeDetector {
  public static detect(): RuntimeEnvironment {
    if (typeof Bun !== 'undefined') {
      return 'bun';
    } else if (typeof Deno !== 'undefined') {
      return 'deno';
    } else if (
      typeof process !== 'undefined' &&
      process.versions &&
      process.versions.node
    ) {
      return 'node';
    }
    return 'unknown';
  }
}
