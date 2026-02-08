import type { LoaderContext } from "../../../src/core/types";
import { useState } from "preact/hooks";
import path from "path";
import { fileURLToPath } from "url";

export async function loader(ctx: LoaderContext) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // point to the actual compiled JS file
  const dbPath = path.join(__dirname, "../../../src/db/index.js");
  const { DB } = await import(`file://${dbPath}`);

  const db = new DB({
    type: "jdb",
    jdb: { root: "./data" },
  });

  await db.connect();
  const users = await db.find("users", {}, { sort: { _created: -1 } });

  return { users };
}

export default function Home({ data }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    window.location.reload();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>jDB Example</h1>

      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
        }}
      >
        <h2>Add User</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Name"
            style={{ marginRight: "0.5rem" }}
          />
          <input
            value={email}
            onInput={(e) => setEmail(e.currentTarget.value)}
            placeholder="Email"
            style={{ marginRight: "0.5rem" }}
          />
          <button type="submit">Save</button>
        </form>
      </div>

      <h2>Users ({data.users.length})</h2>
      <ul>
        {data.users.map((user: any) => (
          <li key={user._id}>
            <strong>{user.name}</strong> ({user.email})
            <br />
            <small style={{ color: "#666" }}>ID: {user._id}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
