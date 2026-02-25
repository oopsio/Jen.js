/*
 * Example server action: publish a blog post
 */

// Temporary stub imports - these validators would be exported from the real jenjs package
interface ServerActionContext {
  body: Record<string, any>;
}

const required = () => (val: any) => val != null;
const minLength = (min: number) => (val: string) => val?.length >= min;

export const metadata = {
  name: "publishPost",
  description: "Publish a blog post",
};

export const validation = {
  title: [required(), minLength(5)],
  content: [required(), minLength(20)],
};

export default async (ctx: ServerActionContext) => {
  const { title, content } = ctx.body;

  // Simulate database operation
  const post = {
    id: Math.random().toString(36).slice(2),
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    post,
  };
};
