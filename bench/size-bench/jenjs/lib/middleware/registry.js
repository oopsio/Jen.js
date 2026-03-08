export class MiddlewareRegistry {
  static instance;
  middleware = new Map();
  groups = new Map();
  constructor() {}
  static get() {
    if (!this.instance) this.instance = new MiddlewareRegistry();
    return this.instance;
  }
  register(name, mw) {
    this.middleware.set(name, mw);
  }
  get(name) {
    return this.middleware.get(name);
  }
  group(groupName, middlewareNames) {
    this.groups.set(groupName, middlewareNames);
  }
  getGroup(groupName) {
    const names = this.groups.get(groupName) || [];
    return names.map((n) => this.get(n)).filter((m) => !!m);
  }
}
