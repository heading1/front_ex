import Jeact from './core/Jeact';
import styled from 'styled-components';

const StyledCounter = styled.div`
  background-color: ${({ bgColor }) => bgColor || 'beige'};
`;
// props.bgColor || 'pink'
const StyledButton = styled.button`
  background-color: ${({ bgColor }) => bgColor || 'pink'};
  color: ${({ bgColor }) => bgColor || 'pink'};
`;

const todos = [{ title: 'title1' }, { title: 'title2' }, { title: 'title3' }];
const CustomDiv = () => {
  return (
    <div>
      <h1>hi</h1>
    </div>
  );
};
// @jsx Jeact.createElement
function Counter() {
  const [state, setState] = Jeact.useState(1);
  const bgColor = 'green';

  return (
    <StyledCounter bgColor={bgColor} className='test1 asdf'>
      <h1 className='test'>Count: {state}</h1>
      <StyledButton bgColor={bgColor} onClick={() => setState((state) => state + 1)}>
        버튼
      </StyledButton>
      <ul>
        {todos.map((todo) => (
          <li>
            {todo.title} <CustomDiv />
          </li>
        ))}
      </ul>
    </StyledCounter>
  );
}

const element = <Counter />;
const container = document.getElementById('root');

Jeact.render(element, container);
