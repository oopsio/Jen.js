export type LuaHook = (table: string, operation: 'insert'|'update'|'delete', data: any)=>void;

export class LuaHooks {
  private hooks: LuaHook[] = [];

  register(hook: LuaHook) { this.hooks.push(hook); }

  run(table: string, op: 'insert'|'update'|'delete', data: any) {
    for(const hook of this.hooks) hook(table, op, data);
  }
}
