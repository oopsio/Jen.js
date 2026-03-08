import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #ccc",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <h2>Interactive Counter (Client Component)</h2>
      <p>
        Current count: <strong>{count}</strong>
      </p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          marginRight: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Increment
      </button>
      <button
        onClick={() => setCount(count - 1)}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Decrement
      </button>
    </div>
  );
}
