import Jeact from './core/Jeact';

// @jsx Jeact.createElement
const element = (
  <div>
    <a>bar</a>
    <b />
  </div>
);

const container = document.getElementById('root');

Jeact.render(element, container);
