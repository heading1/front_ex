import render from './render.js';
import CounterApp from '../counter/CounterApp.js';

let state = undefined;

/**
 * 초기 상태를 설정하고 상태 값과 set함수를 반환하는 함수
 * @param {any} initState
 * @returns {[any, function]}
 */
export default function useState(initState) {
  if (!state) {
    state = initState;
  }

  function setFunction(changedState) {
    state = changedState;
    render('#app', CounterApp);
  }

  return [state, setFunction];
}
