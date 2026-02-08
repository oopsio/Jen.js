export default async function handler(ctx: any) {
  return {
    ok: true,
    message: "Hello from API route",
    method: ctx.method,
    query: ctx.query,
    body: ctx.body,
  };
}
