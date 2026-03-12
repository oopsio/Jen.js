import { useState } from 'preact/hooks';
import Text from './components/Text'

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
    <Text />
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
    </>
  );
}