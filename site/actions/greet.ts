/*
 * Example server action: simple greeting
 */

// Temporary stub imports - these validators would be exported from the real jenjs package
interface ServerActionContext {
  body: Record<string, any>;
}

const required = () => (val: any) => val != null;
const minLength = (min: number) => (val: string) => val?.length >= min;

export const metadata = {
  name: "greet",
  description: "Send a greeting to a user",
};

export const validation = {
  name: [required(), minLength(2)],
};

export default async (ctx: ServerActionContext) => {
  const { name } = ctx.body;
  return {
    success: true,
    message: `Hello, ${name}!`,
  };
};
