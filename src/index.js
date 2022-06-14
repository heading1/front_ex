import Jeact from './core/Jeact';
import styled from 'styled-components';

const StyledCounter = styled.div`
  background-color: beige;
`;

const StyledButton = styled.button`
  background-color: pink;
`;

// @jsx Jeact.createElement
function Counter() {
  const [state, setState] = Jeact.useState(1);
  // style={{ border: 'thick double #32a1ce' }}
  return (
    <StyledCounter className='test1 asdf'>
      <h1 className='test'>Count: {state}</h1>
      <StyledButton onClick={() => setState((state) => state + 1)}>버튼</StyledButton>
    </StyledCounter>
  );
}

const element = <Counter />;
const container = document.getElementById('root');

Jeact.render(element, container);
