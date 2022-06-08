import CounterApp from '../counter/CounterApp.js';

export default function render() {
  const app = document.querySelector('#app');
  app.innerHTML = CounterApp();
}
