export async function bodyParser(ctx, next) {
  if (ctx.req.method === "GET" || ctx.req.method === "HEAD") {
    return next();
  }
  const chunks = [];
  await new Promise((resolve, reject) => {
    ctx.req.on("data", (chunk) => chunks.push(chunk));
    ctx.req.on("end", () => {
      const data = Buffer.concat(chunks).toString();
      const contentType = ctx.req.headers["content-type"] || "";
      try {
        if (contentType.includes("application/json")) {
          ctx.body = JSON.parse(data);
        } else {
          ctx.body = data;
        }
      } catch (e) {
        ctx.body = data; // Raw string on failure
      }
      resolve();
    });
    ctx.req.on("error", reject);
  });
  await next();
}
