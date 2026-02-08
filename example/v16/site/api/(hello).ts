/**
 * Simple Hello World API
 * Using old API format (single default handler)
 */

export default async function handler(ctx: any) {
  const name = ctx.query?.name || "World";

  return {
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    features: ["Islands", "Middleware", "API Routes", "Zero-JS"],
  };
}
