export class LuaHooks {
    hooks = [];
    register(hook) { this.hooks.push(hook); }
    run(table, op, data) {
        for (const hook of this.hooks)
            hook(table, op, data);
    }
}
