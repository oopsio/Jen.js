/**
 * Todo Detail API
 * GET /api/todos/[id] - Get single todo
 * PUT /api/todos/[id] - Update todo
 * DELETE /api/todos/[id] - Delete todo
 */

import type { ApiRequest, ApiResponse } from '../../../../../src/api';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

// Shared storage
let todos: Todo[] = [
  { id: 1, title: 'Learn Jen.js', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: 'Build API routes', completed: true, createdAt: new Date().toISOString() },
  { id: 3, title: 'Deploy to production', completed: false, createdAt: new Date().toISOString() },
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Get ID from dynamic route parameter
  const { id } = req.params;
  const todoId = parseInt(String(id), 10);

  if (isNaN(todoId)) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const todoIndex = todos.findIndex((t) => t.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (req.method === 'GET') {
    // Get single todo
    res.status(200).json({
      data: todos[todoIndex],
    });
  } else if (req.method === 'PUT') {
    // Update todo
    const { title, completed } = req.body;
    const todo = todos[todoIndex];

    if (title !== undefined) {
      if (typeof title !== 'string') {
        return res.status(400).json({ error: 'Invalid title' });
      }
      todo.title = title.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid completed flag' });
      }
      todo.completed = completed;
    }

    res.status(200).json({
      message: 'Todo updated',
      data: todo,
    });
  } else if (req.method === 'DELETE') {
    // Delete todo
    const deleted = todos.splice(todoIndex, 1)[0];

    res.status(200).json({
      message: 'Todo deleted',
      data: deleted,
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
