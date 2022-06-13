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
let wipRoot = null;
let currentRoot = null;
let deletions = null; // 오래된 노드 삭제하기 위한 배열

const isEvent = (key) => key.startsWith('on'); // 이벤트 리스너 처리
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  // 이벤트 리스너의 변경 시 삭제
  Object.keys(prevProps)
    .filter(isEvent) // old fiber의 이벤트 목록
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key)) // old fiber의 이벤트가 삭제,변경됐는지 검사
    .forEach((name) => {
      // 변경되었다면 old fiber에 등록된 이벤트 삭제
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 이벤트 리스너를 제외한 old props(속성) 삭제
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // 새로운 이벤트 리스너 등록
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  // 새로운 props중 props만 (이벤트, child 제외하고) 추가
  Object.keys(nextProps) // 다음 속성
    .filter(isProperty) // props(속성)인지
    .filter(isNew(prevProps, nextProps)) // 새로운 속성인지
    .forEach((name) => {
      dom[name] = nextProps[name]; // 새로운 속성만 dom에 추가
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  // fiber의 태그로 구별
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    // 부모 fiber 노드에 자식 DOM 노드를 추가
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    // 이미 존재하는 DOM 노드를 변경된 props로 갱신
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    // 자식을 부모 DOM에 제거
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  // 1. 렌더 실행 시 다음 단위 작업에 루트 fiber 설정
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, // 이전 커밋 단계에서 DOM에 추가했던 fiber에 대한 링크
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function workLoop(deadline) {
  let shouldYield = false;
  // 2. 단위 작업이 있고 현재 작업의 시간이 남아있을때
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1; // requestIdleCallback에서 주는 콜백으로 작업 남은 시간을 가져올 수 있다
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
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

  const elements = fiber.props.children; // fiber의 자식 요소들
  reconcileChildren(fiber, elements);
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

// 오래된 fiber를 새로운 엘리먼트로 재조정(reconcile)
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  // 자식요소들 순회
  // 리액트는 더 나은 재조정을 위해 key 를 사용한다.
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    // 자식 요소의 기본 형태
    // const newFiber = {
    //   type: element.type,
    //   props: element.props,
    //   parent: fiber, // 현재 fiber가 부모이다
    //   dom: null, // dom 은 null 이지만 순차적으로 탐색하며 node가 생성 추가됨
    // };

    const sameType = oldFiber && element && element.type === oldFiber.type;
    // old fiber와 새로운 엘리먼트가 같은 타입이라면
    if (sameType) {
      // DOM 노드를 유지하고 새로운 props만 업데이트
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE', // 이 속성은 나중에 커밋 단계에서 사용
      };
    }
    // 서로 다 타입이 다르고 새로운 엘리먼트가 존재한다면
    if (element && !sameType) {
      // 새로운 DOM 노드 생성
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT', // 이 속성은 나중에 커밋 단계에서 사용
      };
    }
    // 타입이 다르고 오래된 fiber가 존재한다면
    if (oldFiber && !sameType) {
      // 오래된 노드를 제거
      oldFiber.effectTag = 'DELETION'; // 이 속성은 나중에 커밋 단계에서 사용
      // 여기서 문제는 fiber 트리를 DOM에 커밋할 때 wipRoot에는 오래된 fiber가 없다.
      deletions.push(oldFiber); // 그러므로 deletions 라는 배열이 필요
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (index === 0) {
      // 첫 번째 자식이라면
      wipFiber.child = newFiber; // 현재 부모 fiber에 현재 자식 fiber 삽입
    } else {
      prevSibling.sibling = newFiber; // 첫 번째 자식이 아니라면 그 전의 형제가 있을 것이고 그 전 형제 fiber의 형제 fiber로 선언
    }

    prevSibling = newFiber; // 다음 형제 fiber를 지금 자식 fiber의 형제 fiber로 등록할 수 있게 이전 형제 fiber로 선언
    index++; // 인덱스를 증가하며 순회
  }

  // 현재 fiber에 자식이 있다면
  if (wipFiber.child) {
    // 현재 자식 fiber 반환 -> 다음 단위 작업 등록
    return wipFiber.child;
  }
}

const Jeact = {
  createElement,
  render,
};

export default Jeact;
