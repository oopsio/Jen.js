export function compose(middlewares) {
    return async (ctx, next) => {
        let index = -1;
        async function dispatch(i) {
            if (i <= index)
                throw new Error("next() called multiple times");
            index = i;
            const fn = middlewares[i] ?? next;
            if (!fn)
                return;
            await fn(ctx, () => dispatch(i + 1));
        }
        await dispatch(0);
    };
}
