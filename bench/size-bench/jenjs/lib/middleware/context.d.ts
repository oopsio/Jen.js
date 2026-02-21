export class Context {
    constructor(req: any, res: any);
    req: any;
    res: any;
    url: URL;
    state: {};
    response: ResponseBuilder;
    body: any;
    query: {
        [k: string]: string;
    };
    params: {};
    get cookies(): {
        [k: string]: any;
    };
    json(data: any, status?: number): void;
}
import { ResponseBuilder } from "./response.js";
