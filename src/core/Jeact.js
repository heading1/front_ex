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

function createDom(element, container) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = element.props[name];
      // element.props[name] 는 element의 props의 children이 아닌 속성들 ex) nodeValue 등등
      // dom[name] 는 현재 element로 만들어진 dom의 속성, 즉, props 를 추가함 ex) a.nodeValue = '뭐시기'
    });

  element.props.children.forEach((child) => render(child, dom));

  return dom
}

function render(element, container){
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}

let nextUnitOfWork = null
​
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1 // requestIdleCallback에서 주는 콜백으로 작업 남은 시간을 가져올 수 있다
  }
   
  // setTimeout과 같읕 개념이다. 실행시점이 setTimeout이 시간이 끝날 때라면 requestIdleCallback 은 메인스레드가 대기 상태일 때 콜백을 실행한다.
  requestIdleCallback(workLoop);
}
​
requestIdleCallback(workLoop)
​
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
​
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null
​
  while (index < elements.length) {
    const element = elements[index]
​
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
  ​
    prevSibling = newFiber
    index++
  }
  
  
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

const Jeact = {
  createElement,
  render,
};

export default Jeact;
