import styled from 'styled-components';
import { customScrollbar } from '../CustomScrollbar';

export const PreviewWrapper = styled.div`
  ${customScrollbar};
  overflow-y: scroll;
  height: 100%;
`;

export const ChunkLoadingSpinnerWrapper = styled.div`
  height: 200px;
  width: calc(100vw - 200px);
`;
