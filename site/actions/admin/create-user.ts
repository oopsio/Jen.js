/*
 * Example server action: admin-only action with validation
 */

// Temporary stub imports - these validators would be exported from the real jenjs package
interface ServerActionContext {
  body: Record<string, any>;
  data?: Record<string, any>;
}

const required = () => (val: any) => val != null;
const email = () => (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const minLength = (min: number) => (val: string) => val?.length >= min;
const enumValue = (values: string[]) => (val: string) => values.includes(val);

export const metadata = {
  name: "createUser",
  description: "Create a new user (admin only)",
  requiresAuth: true,
};

export const validation = {
  username: [required(), minLength(3)],
  email: [required(), email()],
  role: [required(), enumValue(["user", "moderator", "admin"])],
};

export default async (ctx: ServerActionContext) => {
  // Check if user is authenticated and is admin
  const userId = ctx.data?.userId;
  const userRole = ctx.data?.role;

  if (!userId) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  if (userRole !== "admin") {
    return {
      success: false,
      message: "Admin privileges required",
    };
  }

  const { username, email: userEmail, role } = ctx.body;

  // Simulate creating user in database
  const newUser = {
    id: Math.random().toString(36).slice(2),
    username,
    email: userEmail,
    role,
    createdAt: new Date().toISOString(),
    createdBy: userId,
  };

  return {
    success: true,
    user: newUser,
  };
};
