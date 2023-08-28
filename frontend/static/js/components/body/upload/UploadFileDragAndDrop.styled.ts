import styled from 'styled-components';

export const DragAndDropWrapper = styled.div`
  border: 2px dashed;
  height: 100px;
  line-height: 100px;
  position: relative;
  text-align: center;
  width: 300px;
`;

export const DropWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(200, 200, 200, 0.7);
  z-index: 2;
  text-align: center;
  line-height: 100px;
`;
