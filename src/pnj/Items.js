import Component from './component.js';

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
    this.target.addEventListener('click', ({ target }) => {
      const items = [...this.state.items];

      if (target.classList.contains('addBtn')) {
        this.setState({ items: [...items, `item${items.length + 1}`] });
      } else if (target.classList.contains('delBtn')) {
        items.splice(target.dataset.index, 1);
        this.setState({ items });
      }
    });
  }
}
