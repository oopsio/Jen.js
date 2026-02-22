/**
 * Todo List API
 * GET /api/todos - List all todos
 * POST /api/todos - Create new todo
 */

import type { ApiRequest, ApiResponse } from "../../../../src/api";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

// In-memory storage (replace with database)
let todos: Todo[] = [
  {
    id: 1,
    title: "Learn Jen.js",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Build API routes",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Deploy to production",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === "GET") {
    // Get all todos
    const { completed } = req.query;

    let filtered = todos;

    if (completed !== undefined) {
      const isCompleted = completed === "true";
      filtered = todos.filter((t) => t.completed === isCompleted);
    }

    res.status(200).json({
      count: filtered.length,
      data: filtered,
    });
  } else if (req.method === "POST") {
    // Create new todo
    const { title } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Missing or invalid title" });
    }

    const newTodo: Todo = {
      id: Math.max(...todos.map((t) => t.id), 0) + 1,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    todos.push(newTodo);

    res.status(201).json({
      message: "Todo created",
      data: newTodo,
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export const config = {
  maxDuration: 30,
  bodyParser: {
    sizeLimit: "1mb",
  },
};
