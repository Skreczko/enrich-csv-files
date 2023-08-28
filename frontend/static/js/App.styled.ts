import styled from 'styled-components';
import { customScrollbar } from './components/body/CustomScrollbar';

export const AppWrapper = styled.div`
  position: relative;
  display: flex;
  min-height: 100vh;
  width: 100vw;
`;

export const MiddleSectionWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 200px;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const BodyWrapper = styled.div`
  ${customScrollbar};
  overflow: auto;
  height: 100%;
`;
