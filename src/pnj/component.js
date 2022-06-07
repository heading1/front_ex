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

class App extends Component {
  setup() {
    this.state = { items: ['item1', 'item2'] };
  }

  template() {
    const { items } = this.state;
    return `
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
      <button>추가</button>
    `;
  }

  setEvent() {
    this.target.querySelector('button').addEventListener('click', () => {
      const { items } = this.state;
      this.setState({ items: [...items, `item${items.length + 1}`] });
    });
  }
}

new App(document.querySelector('#app'));
