export async function securityHeaders(ctx, next) {
    ctx.response.header('X-DNS-Prefetch-Control', 'off');
    ctx.response.header('X-Frame-Options', 'SAMEORIGIN');
    ctx.response.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    ctx.response.header('X-Download-Options', 'noopen');
    ctx.response.header('X-Content-Type-Options', 'nosniff');
    ctx.response.header('X-XSS-Protection', '1; mode=block');
    await next();
}
