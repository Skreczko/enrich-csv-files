import styled from 'styled-components';
import { EnrichModalDescription } from './EnrichStep1Modal.styled';

export const EnrichProcessSelectionWrapper = styled.div`
  display: grid;
  justify-items: center;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 50px;

  img {
    height: 100px;
    width: 100px;
  }

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    word-break: break-all;
  }
`;

export const EnrichJoinTypeDescription = styled(EnrichModalDescription)`
  margin-top: 50px;
`;
