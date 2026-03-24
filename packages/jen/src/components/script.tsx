import { h, ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';

// This is statically replaced by Vite using 'define' configs based on jen.config.ts defaults
declare const __JEN_REQUIRE_SCRIPT_FLAG__: boolean;

export interface ScriptProps {
  id?: string;
  src?: string;
  /**
   * For security reasons, Jen.js forces you to acknowledge third party script usage unless global disabled.
   */
  dangerouslySetScripts?: boolean;
  /**
   * Defines when the script executes. 
   * - beforeInteractive: Rendered synchronously
   * - afterInteractive (default): Pushed after client load
   * - lazyOnload: Delayed with idle callbacks
   */
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  children?: ComponentChildren;
  [key: string]: unknown;
}

/**
 * Optimized Third-Party Script Injector
 */
export function Script({
  dangerouslySetScripts,
  strategy = 'afterInteractive',
  src,
  id,
  children,
  ...rest
}: ScriptProps) {
  // Check custom script execution allowance via config flags
  const isRequired = typeof __JEN_REQUIRE_SCRIPT_FLAG__ !== 'undefined' ? __JEN_REQUIRE_SCRIPT_FLAG__ : true;
  
  if (isRequired && !dangerouslySetScripts) {
    if (typeof console !== 'undefined') {
      console.warn(`[Jen.js Security] Blocked script ${id || src || 'inline'} execution. You must set dangerouslySetScripts={true} or disable the requirement globally in jen.config.ts.`);
    }
    return null; // Prevents the script from rendering entirely
  }

  // 1. SSR / Direct Inject (beforeInteractive avoids asynchronous hooks)
  if (strategy === 'beforeInteractive') {
    return h('script', {
      id,
      src,
      ...rest,
      dangerouslySetInnerHTML: children ? { __html: children as string } : undefined
    });
  }

  // 2. Client Side Hydration (lazyOnload, afterInteractive)
  const isClient = typeof window !== 'undefined';
  
  if (isClient) {
    useEffect(() => {
      if (id && document.getElementById(id)) return; // Prevent duplicate IDs

      const injectScript = () => {
        const script = document.createElement('script');
        if (id) script.id = id;
        if (src) script.src = src;
        
        // Pass down arbitrary DOM props (async, defer, crossOrigin, etc)
        for (const [key, value] of Object.entries(rest)) {
          if (value !== undefined && value !== null) {
            script.setAttribute(key, String(value));
          }
        }

        if (children) {
          script.innerHTML = children.toString();
        }

        document.body.appendChild(script);
      };

      if (strategy === 'lazyOnload') {
        if ('requestIdleCallback' in window) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).requestIdleCallback(injectScript);
        } else {
          setTimeout(injectScript, 2000);
        }
      } else {
        // execute post-mount natively for afterInteractive
        injectScript();
      }
    }, [src, id, strategy, children, rest]);
  }

  return null;
}
