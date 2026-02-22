export class MiddlewareRegistry {
  static instance: any;
  static get(): any;
  middleware: Map<any, any>;
  groups: Map<any, any>;
  register(name: any, mw: any): void;
  get(name: any): any;
  group(groupName: any, middlewareNames: any): void;
  getGroup(groupName: any): any;
}
