export function rateLimit(options) {
    const hits = new Map();
    return async (ctx, next) => {
        const ip = ctx.req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        let record = hits.get(ip);
        if (!record || now > record.resetTime) {
            record = { count: 0, resetTime: now + options.windowMs };
            hits.set(ip, record);
        }
        record.count++;
        if (record.count > options.max) {
            ctx.response.status(429).json({ error: options.message || 'Too many requests' });
            ctx.response.send();
            return;
        }
        await next();
    };
}
