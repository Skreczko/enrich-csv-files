import styled from 'styled-components';
import { EnrichModalJsonRootPathModalBody } from './EnrichJsonRootPathInfoModal.styled';

export const EnrichModalJsonFlatten2Columns = styled(EnrichModalJsonRootPathModalBody)`
  grid-template-columns: 30% 1fr;
  row-gap: 50px;
  img {
    display: block;
    margin: 0 auto 50px auto;
  }
`;
