import { Pipeline } from "./pipeline.js";
import { MiddlewareRegistry } from "./registry.js";
import { Context } from "./context.js";
export class Kernel {
  globalMiddleware = [];
  constructor() {}
  use(mw) {
    this.globalMiddleware.push(mw);
  }
  async handle(req, res) {
    const ctx = new Context(req, res);
    const fn = Pipeline.compose(this.globalMiddleware);
    await fn(ctx, async () => {});
  }
  async handleWithGroup(req, res, groupName) {
    const ctx = new Context(req, res);
    const registry = MiddlewareRegistry.get();
    const groupMw = registry.getGroup(groupName);
    const fn = Pipeline.compose([...this.globalMiddleware, ...groupMw]);
    await fn(ctx, async () => {});
  }
}
