import { h } from 'preact';
import { PartialRegistry } from '../core/partials.js';

export interface PartialProps {
  /** The registered name of the partial to render */
  name: string;
  /** Accept any additional props to pass to the partial */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Renders a dynamically registered Partial component.
 *
 * @example
 * ```tsx
 * <Partial name="card" title="Hello Jen.js" />
 * ```
 */
export function Partial({ name, ...rest }: PartialProps) {
  const Component = PartialRegistry.get(name);

  if (!Component) {
    throw new Error(
      `[Jen.js Partials] Error: Partial "${name}" not found. ` +
        `Did you forget to register it? Ensure it's registered via PartialRegistry.register('${name}', ...)`
    );
  }

  return h(Component, rest);
}
