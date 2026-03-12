/**
 * Example API Route: GET /api/hello
 *
 * Basic example showing JSON response
 */
export default function handler(req, res) {
    res.status(200).json({
        message: "Hello from Jen.js API!",
        timestamp: new Date().toISOString(),
    });
}
