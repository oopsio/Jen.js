export class ResponseBuilder {
    constructor(res: any);
    statusCode: number;
    headers: {};
    body: null;
    res: any;
    status(code: any): this;
    header(key: any, value: any): this;
    json(data: any): this;
    html(html: any): this;
    text(text: any): this;
    send(): void;
}
