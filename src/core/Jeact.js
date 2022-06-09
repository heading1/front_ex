function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
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
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = element.props[name];
      // element.props[name] 는 element의 props의 children이 아닌 속성들 ex) nodeValue 등등
      // dom[name] 는 현재 element로 만들어진 dom의 속성, 즉, props 를 추가함 ex) a.nodeValue = '뭐시기'
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

let nextUnitOfWork = null
​
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
   
  // setTimeout과 같읕 개념이다. 실행시점이 setTimeout이 시간이 끝날 때라면 requestIdleCallback 은 메인스레드가 대기 상태일 때 콜백을 실행한다.
  requestIdleCallback(workLoop);
}
​
requestIdleCallback(workLoop)
​
function performUnitOfWork(nextUnitOfWork) {
  // TODO
}

const Jeact = {
  createElement,
  render,
};

export default Jeact;
