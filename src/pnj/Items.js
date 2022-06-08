import Component from './component.js';

// 더 이상 사용하지 않음
export default class Items extends Component {
  setup() {
    this.state = { items: ['item1', 'item2'] };
  }

  template() {
    const { items } = this.state;
    return `
      <ul>
        ${items
          .map(
            (item, index) => `
          <li>
            ${item}
            <button class='delBtn' data-index=${index}>삭제</button>
          </li>
        `
          )
          .join('')}
      </ul>
      <button class='addBtn'>추가</button>
    `;
  }

  setEvent() {
    /**
     * bubbling을 활용한 깔끔한 event handling
     */
    this.addEvent('click', '.addBtn', () => {
      const { items } = this.state;
      this.setState({ items: [...items, `item${items.length + 1}`] });
    });

    this.addEvent('click', '.delBtn', ({ target }) => {
      const { items } = this.state;
      items.splice(target.dataset.index, 1);
      this.setState({ items });
    });
  }
}
