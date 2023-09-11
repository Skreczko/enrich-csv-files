import styled from 'styled-components';
import { customScrollbar } from './components/body/CustomScrollbar';

export const mainGreen = '#4bc5ac';
export const toolbarBackground = '#1b2028';
export const tableMainColor = '#84b1b5';
export const tableTextColor = '#405c60';
export const activePaginationTab = '#00E1CE';
export const mainDisabled = '#b0b0b0';

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
