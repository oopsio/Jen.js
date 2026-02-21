export function UseMiddleware(
  ...middleware: any[]
): (target: any, propertyKey: any, descriptor: any) => void;
export const MIDDLEWARE_METADATA_KEY: unique symbol;
