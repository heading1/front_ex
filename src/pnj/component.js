export default class Component {
  // target DOM
  target;
  // target State
  state;

  constructor(target) {
    this.target = target;
    this.setup();
    this.render();
    this.setEvent();
  }

  render() {
    this.target.innerHTML = this.template();
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  addEvent(eventType, selector, callback) {
    // querySelectorAll은 nodelist를 반환하기 때문에 includes 메소드를 사용할 수 없다. 따라서 spread 연산자를 사용해 Array로 만드는 것
    const children = [...this.target.querySelectorAll(selector)];

    // target이 자식에 존재하는 지
    const isTarget = (target) => children.includes(target) || target.closest(selector);

    this.target.addEventListener(eventType, (event) => {
      if (!isTarget(event.target)) return false;
      callback(event);
    });
  }

  // 하위 3개 메소드는 커스텀 컴포넌트 사용 시 정의해서 사용
  setup() {}

  template() {
    return '';
  }

  setEvent() {}
}
