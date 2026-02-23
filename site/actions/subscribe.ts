/*
 * Example server action: subscribe to newsletter
 */

import type { ServerActionContext } from "jenjs";
import { required, email } from "jenjs";

export const metadata = {
  name: "subscribeNewsletter",
  description: "Subscribe to the newsletter",
};

export const validation = {
  email: [required(), email()],
};

export default async (ctx: ServerActionContext) => {
  const { email: userEmail } = ctx.body;

  // Simulate subscription
  return {
    success: true,
    message: `Subscribed ${userEmail} to the newsletter`,
  };
};
