export class ResponseBuilder {
  statusCode = 200;
  headers = {};
  body = null;
  res;
  constructor(res) {
    this.res = res;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  header(key, value) {
    this.headers[key] = value;
    return this;
  }
  json(data) {
    this.header("Content-Type", "application/json");
    this.body = JSON.stringify(data);
    return this;
  }
  html(html) {
    this.header("Content-Type", "text/html");
    this.body = html;
    return this;
  }
  text(text) {
    this.header("Content-Type", "text/plain");
    this.body = text;
    return this;
  }
  send() {
    if (this.res.writableEnded) return;
    this.res.writeHead(this.statusCode, this.headers);
    if (this.body !== null && this.body !== undefined) {
      this.res.end(this.body);
    } else {
      this.res.end();
    }
  }
}
