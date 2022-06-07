class Component {
  target;
  state;

  constructor(target) {
    this.target = target;
    this.setup();
    this.render();
  }

  render() {
    this.target.innerHTML = this.template();
    this.setEvent();
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  // 하위 3개 메소드는 커스텀 컴포넌트 사용 시 정의해서 사용
  setup() {}

  template() {
    return '';
  }

  setEvent() {}
}

export default Component;
