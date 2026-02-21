export class Kernel {
    globalMiddleware: any[];
    use(mw: any): void;
    handle(req: any, res: any): Promise<void>;
    handleWithGroup(req: any, res: any, groupName: any): Promise<void>;
}
