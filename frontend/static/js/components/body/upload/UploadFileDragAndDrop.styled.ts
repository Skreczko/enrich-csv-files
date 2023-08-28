import styled, { keyframes } from 'styled-components';

const shake = keyframes`
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
`;

export const DragAndDropWrapper = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  height: 50vh;
  width: 50vw;
  border: 2px dashed;
  line-height: 100px;
`;

export const DragWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    height: 100px;
    width: 100px;
    animation: ${shake} 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  p {
    font-size: 25px;
  }
`;

export const DropWrapper = styled(DragWrapper)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background-color: rgba(200, 200, 200, 0.7);
`;
