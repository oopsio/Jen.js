export class Pipeline {
    static compose(middleware: any): (context: any, next: any) => any;
    static resolveMiddleware(mw: any): any;
}
