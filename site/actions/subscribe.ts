/*
 * Example server action: subscribe to newsletter
 */

// Temporary stub imports - these validators would be exported from the real jenjs package
interface ServerActionContext {
  body: Record<string, any>;
}

const required = () => (val: any) => val != null;
const email = () => (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

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
