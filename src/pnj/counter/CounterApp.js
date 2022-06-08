import useState from '../libraries/useState.js';

export default function CounterApp() {
  const [count, setCount] = useState(0);

  window.increment = () => setCount(count + 1);

  return `
    <div>
      <h1>Hello!</h1>
      <strong>count: ${count}  </strong>
      <button onclick="increment()">증가</button>
    </div>
  `;
}
