import * as Bingact from './Bingact/Bingact.js';

const element = Bingact.createElement(
  'div', // type
  { id: 'foo' }, // props
  // children
  Bingact.createElement('a', null, 'bar'),
  Bingact.createElement('b')
);

/** @jsx Bingact.createElement */
const element1 = (
  <div id='foo'>
    <h1>element1</h1>
    <b />
  </div>
);

const container = document.getElementById('root');

/** render */
Bingact.render(element, container);
Bingact.render(element1, container);
