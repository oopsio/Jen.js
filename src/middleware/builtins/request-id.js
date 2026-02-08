import { randomUUID } from "node:crypto";
export async function requestId(ctx, next) {
  const id = ctx.req.headers["x-request-id"] || randomUUID();
  ctx.response.header("X-Request-ID", id);
  // Also attach to context for logger
  ctx.state.requestId = id;
  await next();
}
