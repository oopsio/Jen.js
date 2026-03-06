export default function handler(ctx: any): Promise<{
  ok: boolean;
  message: string;
  method: any;
  query: any;
  body: any;
}>;
