interface CounterProps {
  initial: number;
  onChange: (count: number) => void;
}

export function Counter({ initial, onChange }: CounterProps) {
  return (
    <section class="counter">
      <h2>Counter: {initial}</h2>
      <div class="controls">
        <button onClick={() => onChange(initial - 1)}>-</button>
        <button onClick={() => onChange(initial + 1)}>+</button>
      </div>
    </section>
  );
}
