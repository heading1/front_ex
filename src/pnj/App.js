import Items from './Items.js';

class App {
  constructor() {
    const app = document.querySelector('#app');
    new Items(app);
  }
}

console.log(new App());
