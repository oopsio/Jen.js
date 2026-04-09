import { expect, test, describe } from 'bun:test';
import { ErrorFormatter } from '../error-formatter.js';

describe('ErrorFormatter', () => {
  test('should gracefully handle String errors', () => {
    const output = ErrorFormatter.formatError(
      'Simple text error',
      'Text Title',
    );
    expect(output).toContain('Simple text error');
    expect(output).toContain('Text Title');
    expect(output).not.toContain('Stack Trace');
    expect(output).not.toContain('Code Snippet');
  });

  test('should handle standard Error instances gracefully without dashes', () => {
    const err = new Error('Syntax failed completely');
    const output = ErrorFormatter.formatError(err, 'Crash');

    expect(output).toContain('Syntax failed completely');
    expect(output).toContain('Stack Trace:');
    expect(output).toContain('>');

    // Verify no arbitrary dashes were used for design headers
    expect(output).not.toContain('---');
  });

  test('should inject vite frames correctly mirroring babel codeframes', () => {
    const err = new Error('Missing token') as any;
    err.frame = '5 | const a = 2;\n6 | let b = a +\n  |             ^';

    const output = ErrorFormatter.formatError(err, 'Vite Crash');
    expect(output).toContain('Code Snippet:');
    expect(output).toContain('5 | const a = 2;');
    expect(output).toContain('^');
  });
});
