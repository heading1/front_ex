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

function createDom(fiber, container) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = fiber.props[name];
      // fiber.props[name] 는 fiber의 props의 children이 아닌 속성들 ex) nodeValue 등등
      // dom[name] 는 현재 fiber로 만들어진 dom의 속성, 즉, props 를 추가함 ex) a.nodeValue = '뭐시기'
    });

  return dom;
}

let nextUnitOfWork = null; // 다음 단위 작업

function render(element, container) {
  // 1. 렌더 실행 시 다음 단위 작업에 루트 fiber 설정
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

function workLoop(deadline) {
  let shouldYield = false;
  // 2. 단위 작업이 있고 현재 작업의 시간이 남아있을때
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1; // requestIdleCallback에서 주는 콜백으로 작업 남은 시간을 가져올 수 있다
  }

  // setTimeout과 같읕 개념이다. 실행시점이 setTimeout이 시간이 끝날 때라면 requestIdleCallback 은 메인스레드가 대기 상태일 때 콜백을 실행한다.
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop); //workLoop 실행하며 단위작업을 수행한다.

function performUnitOfWork(fiber) {
  // fiber의 돔이 없을 때
  if (!fiber.dom) {
    // 새로운 노드를 생성하고 DOM에 이를 추가한다.
    fiber.dom = createDom(fiber);
  }
  // 부모 fiber을 가질 때 즉, 자식 fiber일 때
  if (fiber.parent) {
    // 계속해서 fiber.dom 속성에 DOM 노드를 추적
    fiber.parent.dom.appendChild(fiber.dom);
  }

  const elements = fiber.props.children; // fiber의 자식 요소들
  let index = 0;
  let prevSibling = null;

  // 자식요소들 순회
  while (index < elements.length) {
    const element = elements[index];
    // 자식 요소의 기본 형태
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber, // 현재 fiber가 부모이다
      dom: null, // dom 은 null 이지만 순차적으로 탐색하며 node가 생성 추가됨
    };

    if (index === 0) {
      // 첫 번째 자식이라면
      fiber.child = newFiber; // 현재 부모 fiber에 현재 자식 fiber 삽입
    } else {
      prevSibling.sibling = newFiber; // 첫 번째 자식이 아니라면 그 전의 형제가 있을 것이고 그 전 형제 fiber의 형제 fiber로 선언
    }

    prevSibling = newFiber; // 다음 형제 fiber를 지금 자식 fiber의 형제 fiber로 등록할 수 있게 이전 형제 fiber로 선언
    index++; // 인덱스를 증가하며 순회
  }

  // 현재 fiber에 자식이 있다면
  if (fiber.child) {
    // 현재 자식 fiber 반환 -> 다음 단위 작업 등록
    return fiber.child;
  }
  // 현재 fiber가 자식 fiber가 없다면
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      // 형제 fiber가 있다면
      // 현재 fiber의 형제 fiber 반환 -> 다음 단위 작업 등록
      return nextFiber.sibling;
    }
    // 현재 fiber가 자식fiber와 형제 fiber도 없다면 부모 fiber를 다음 fiber로 등록
    nextFiber = nextFiber.parent;
  }
}

const Jeact = {
  createElement,
  render,
};

export default Jeact;
