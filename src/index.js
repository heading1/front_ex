import Jeact from './core/Jeact';

// @jsx Jeact.createElement
function Counter() {
  const [state, setState] = Jeact.useState(1);

  return (
    <div>
      <h1>Count: {state}</h1>
      <button onClick={() => setState((state) => state + 1)}>버튼</button>
    </div>
  );
}

const element = <Counter />;
const container = document.getElementById('root');

Jeact.render(element, container);
