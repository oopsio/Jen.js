import type { Plugin } from 'vite';
import path from 'node:path';

/**
 * Jen.js Server Components & Actions Plugin
 * 
 * Handles "use server" and "use client" directives.
 * Strips server-only code from client bundles and creates action proxies.
 */
export function jenServerPlugin(): Plugin {
  return {
    name: 'jen-server',
    enforce: 'pre',

    async transform(code, id, options) {
      const isSSR = options?.ssr;
      
      // Only process JS/TS files
      if (!/\.(t|j)sx?$/.test(id)) {
        return null;
      }

      const hasUseServer = code.includes('"use server"') || code.includes("'use server'");
      const hasUseClient = code.includes('"use client"') || code.includes("'use client'");

      if (hasUseServer) {
        if (isSSR) {
          // SERVER SIDE: Register actions
          // We'll append registration logic to the end of the file
          // Note: This is a simplified implementation. A real one would use AST for precise identification.
          const relativePath = path.relative(process.cwd(), id).replace(/\\/g, '/');
          
          // Find named exports (crude regex for PoC, real one should use AST)
          const exportMatches = [...code.matchAll(/export (async )?function ([a-zA-Z0-9_$]+)/g)];
          let registrationCode = `\nimport { ActionRegistry } from '@jenjs/core/actions';\n`;
          
          for (const match of exportMatches) {
            const name = match[2];
            const actionId = Buffer.from(`${relativePath}:${name}`).toString('base64');
            registrationCode += `ActionRegistry.register("${actionId}", ${name});\n`;
          }

          return {
            code: code + registrationCode,
            map: null
          };
        } else {
          // CLIENT SIDE: Replace with proxies
          const relativePath = path.relative(process.cwd(), id).replace(/\\/g, '/');
          const exportMatches = [...code.matchAll(/export (async )?function ([a-zA-Z0-9_$]+)/g)];
          
          let proxyCode = `"use client";\n`;
          
          for (const match of exportMatches) {
            const name = match[2];
            const actionId = Buffer.from(`${relativePath}:${name}`).toString('base64');
            proxyCode += `export async function ${name}(...args) {
              const res = await fetch('/api/__actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: "${actionId}", args })
              });
              const result = await res.json();
              if (!result.success) throw new Error(result.error);
              return result.data;
            }\n`;
          }

          return {
            code: proxyCode,
            map: null
          };
        }
      }

      if (hasUseClient && !isSSR) {
        // Just remove the directive for the actual client build if needed, 
        // though it doesn't hurt.
      }

      return null;
    }
  };
}
