/**
 * 컴포넌트를 렌더링하는 함수
 * @param {string} selector
 * @param {function} callback
 */
export default function render(selector, callback) {
  const element = document.querySelector(selector);
  element.innerHTML = callback();
}
