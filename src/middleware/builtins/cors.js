export function cors(options = {}) {
    const defaults = {
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
    };
    const opts = { ...defaults, ...options };
    return async (ctx, next) => {
        const origin = ctx.req.headers.origin;
        if (opts.origin === '*' || (origin && typeof opts.origin === 'function' && opts.origin(origin)) || opts.origin === origin) {
            ctx.response.header('Access-Control-Allow-Origin', origin || '*');
        }
        if (opts.credentials) {
            ctx.response.header('Access-Control-Allow-Credentials', 'true');
        }
        if (ctx.req.method === 'OPTIONS') {
            ctx.response.header('Access-Control-Allow-Methods', opts.methods.join(','));
            ctx.response.header('Access-Control-Allow-Headers', opts.allowedHeaders.join(','));
            if (opts.maxAge) {
                ctx.response.header('Access-Control-Max-Age', opts.maxAge);
            }
            ctx.response.status(204).send();
            return;
        }
        await next();
    };
}
