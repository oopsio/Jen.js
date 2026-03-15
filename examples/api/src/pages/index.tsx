/**
 * Example frontend page demonstrating API calls
 */

import { h, FunctionComponent } from "preact";
import { useState, useEffect } from "preact/hooks";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const HomePage: FunctionComponent = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/todos");
      const json = await response.json();
      setTodos(json.data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e: Event) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodoTitle }),
      });

      if (response.ok) {
        setNewTodoTitle("");
        await fetchTodos();
      }
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (response.ok) {
        await fetchTodos();
      }
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        await fetchTodos();
      }
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  };

  const search = async (e: Event) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`,
      );
      const json = await response.json();
      setSearchResults(json.results);
    } catch (err) {
      console.error("Failed to search:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1> Jen.js API Routes Example</h1>

      {/* Hello API Demo */}
      <section
        style={{
          marginBottom: "40px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>Hello World API</h2>
        <p>Test the basic API endpoint:</p>
        <button
          onClick={() =>
            fetch("/api/hello")
              .then((r) => r.json())
              .then(console.log)
          }
        >
          Call /api/hello →
        </button>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Check console for response
        </p>
      </section>

      {/* Todo List Demo */}
      <section style={{ marginBottom: "40px" }}>
        <h2> Todo List (CRUD Operations)</h2>

        {/* Add Todo Form */}
        <form
          onSubmit={createTodo}
          style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Add a new todo..."
            value={newTodoTitle}
            onInput={(e) =>
              setNewTodoTitle((e.target as HTMLInputElement).value)
            }
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </form>

        {/* Todo List */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  padding: "15px",
                  marginBottom: "10px",
                  background: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: todo.completed ? "#999" : "#000",
                    }}
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    padding: "5px 10px",
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Search Demo */}
      <section style={{ marginBottom: "40px" }}>
        <h2> Search API (Query Parameters)</h2>
        <form
          onSubmit={search}
          style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Search (e.g., 'framework', 'preact')..."
            value={searchQuery}
            onInput={(e) =>
              setSearchQuery((e.target as HTMLInputElement).value)
            }
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <div
            style={{
              background: "#f0f8ff",
              padding: "15px",
              borderRadius: "4px",
            }}
          >
            <p
              style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}
            >
              Found {searchResults.length} results for "{searchQuery}"
            </p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  style={{
                    paddingBottom: "10px",
                    marginBottom: "10px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <h4 style={{ margin: "0 0 5px 0" }}>{result.title}</h4>
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                    {result.description}
                  </p>
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Relevance: {(result.relevance * 100).toFixed(0)}%
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* API Examples */}
      <section
        style={{
          marginBottom: "40px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2> More API Examples</h2>
        <ul>
          <li>
            <strong>Dynamic Routes:</strong>
            <code>/api/todos/1</code> - Get, update, delete single todo
          </li>
          <li>
            <strong>Nested Routes:</strong>
            <code>/api/users/123/profile</code> - Get user profile
          </li>
          <li>
            <strong>Catch-all Routes:</strong>
            <code>/api/files/docs/guides/getting-started.md</code> - Any file
            path
          </li>
          <li>
            <strong>File Upload:</strong>
            <code>POST /api/upload</code> - Upload files
          </li>
        </ul>

        <h3>Try with curl:</h3>
        <pre
          style={{
            background: "#222",
            color: "#0f0",
            padding: "15px",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "12px",
          }}
        >
          {`# Get all todos
curl http://localhost:3000/api/todos

# Get single todo
curl http://localhost:3000/api/todos/1

# Create todo
curl -X POST http://localhost:3000/api/todos \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Learn Jen.js"}'

# Search
curl "http://localhost:3000/api/search?q=framework&limit=5"

# Get user profile
curl http://localhost:3000/api/users/123/profile

# Get file info
curl http://localhost:3000/api/files/docs/guide.md`}
        </pre>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          paddingTop: "40px",
          borderTop: "1px solid #ddd",
          color: "#666",
          fontSize: "14px",
        }}
      >
        <p>Built with Jen.js • Powered by Preact</p>
        <p>
          <a
            href="https://github.com/oopsio/jen.js"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          {" • "}
          <a href="/docs" target="_blank" rel="noopener">
            Docs
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
