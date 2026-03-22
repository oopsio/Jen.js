/**
 * Plugin Error Classes
 */

/**
 * Plugin-related error
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public pluginName?: string,
    public hookName?: string,
  ) {
    super(message);
    this.name = 'PluginError';
  }

  toString(): string {
    let msg = `[Plugin Error] ${this.message}`;
    if (this.pluginName) {
      msg += ` (plugin: ${this.pluginName})`;
    }
    if (this.hookName) {
      msg += ` (hook: ${this.hookName})`;
    }
    return msg;
  }
}

/**
 * Plugin not found error
 */
export class PluginNotFoundError extends PluginError {
  constructor(pluginName: string) {
    super(`Plugin "${pluginName}" not found`, pluginName);
    this.name = 'PluginNotFoundError';
  }
}

/**
 * Plugin already registered error
 */
export class PluginAlreadyRegisteredError extends PluginError {
  constructor(pluginName: string) {
    super(`Plugin "${pluginName}" is already registered`, pluginName);
    this.name = 'PluginAlreadyRegisteredError';
  }
}

/**
 * Plugin validation error
 */
export class PluginValidationError extends PluginError {
  constructor(message: string, pluginName?: string) {
    super(message, pluginName);
    this.name = 'PluginValidationError';
  }
}

/**
 * Plugin hook error
 */
export class PluginHookError extends PluginError {
  constructor(
    message: string,
    pluginName: string,
    hookName: string,
    public originalError?: Error,
  ) {
    super(message, pluginName, hookName);
    this.name = 'PluginHookError';
  }
}
