export class HttpError extends Error {
  constructor(statusCode: any, message: any, details: any);
  statusCode: any;
  details: any;
}
