function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  const isProperty = (key) => key !== 'children';

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

const 리액트 = {
  createElement,
  render,
};

const element = 리액트.createElement(
  'div', // type
  { id: 'foo' }, // props
  // children
  리액트.createElement('a', null, 'bar'),
  리액트.createElement('b')
);

/** @jsx 리액트.createElement */
// const element1 = (
//   <div id='foo'>
//     <a>bar</a>
//     <b />
//   </div>
// );

const container = document.getElementById('root');

/** render */
리액트.render(element, container);

// const node = document.createElement(element.type);
// node['title'] = element.props.title;

// const text = document.createTextNode('');
// text['nodeValue'] = element.props.children;

// node.appendChild(text);
// container.appendChild(node);
