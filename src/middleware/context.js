import { ResponseBuilder } from "./response.js";
export class Context {
  req;
  res;
  url;
  state;
  response;
  body; // For parsed body
  query;
  params;
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.url = new URL(
      req.url ?? "/",
      `http://${req.headers.host || "localhost"}`,
    );
    this.state = {};
    this.response = new ResponseBuilder(res);
    this.body = null;
    this.query = Object.fromEntries(this.url.searchParams);
    this.params = {};
  }
  get cookies() {
    const header = this.req.headers.cookie;
    if (!header) return {};
    return Object.fromEntries(
      header.split(";").map((c) => {
        const [key, ...v] = c.trim().split("=");
        return [key, decodeURIComponent(v.join("="))];
      }),
    );
  }
  json(data, status = 200) {
    return this.response.status(status).json(data).send();
  }
}
