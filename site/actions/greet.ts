/*
 * Example server action: simple greeting
 */

import type { ServerActionContext } from "jenjs";
import { required, minLength } from "jenjs";

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
