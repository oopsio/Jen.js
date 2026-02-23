/*
 * Example server action: publish a blog post
 */

import type { ServerActionContext } from "jenjs";
import { required, minLength } from "jenjs";

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
