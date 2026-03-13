/**
 * Example API Route: GET|POST /api/posts
 *
 * Example showing HTTP method handling and request body parsing
 */
const posts = [
    { id: 1, title: "First Post", content: "Hello World" },
    { id: 2, title: "Second Post", content: "Jen.js is awesome" },
];
export default async function handler(req, res) {
    if (req.method === "GET") {
        // Get all posts
        res.status(200).json({ data: posts });
    }
    else if (req.method === "POST") {
        // Create new post
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Missing title or content" });
        }
        const newPost = {
            id: posts.length + 1,
            title,
            content,
        };
        posts.push(newPost);
        res.status(201).json({ data: newPost });
    }
    else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
// Optional configuration
export const config = {
    maxDuration: 30,
    bodyParser: {
        sizeLimit: "1mb",
    },
};
