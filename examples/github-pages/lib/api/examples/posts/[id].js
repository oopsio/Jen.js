/**
 * Example Dynamic API Route: GET|PUT|DELETE /api/posts/[id]
 *
 * Example showing dynamic route parameters
 */
const posts = [
  { id: 1, title: "First Post", content: "Hello World" },
  { id: 2, title: "Second Post", content: "Jen.js is awesome" },
];
export default async function handler(req, res) {
  const { id } = req.params;
  const postId = parseInt(String(id), 10);
  if (isNaN(postId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (req.method === "GET") {
    // Get single post
    res.status(200).json({ data: post });
  } else if (req.method === "PUT") {
    // Update post
    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    res.status(200).json({ data: post });
  } else if (req.method === "DELETE") {
    // Delete post
    const index = posts.findIndex((p) => p.id === postId);
    posts.splice(index, 1);
    res.status(200).json({ message: "Post deleted" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
