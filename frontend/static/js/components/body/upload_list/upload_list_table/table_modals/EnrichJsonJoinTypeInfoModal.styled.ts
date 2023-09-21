import styled from 'styled-components';
import { EnrichModalJsonRootPathModalBody } from './EnrichJsonRootPathInfoModal.styled';

export const EnrichJsonJoinTypeExampleTablesWrapper = styled(EnrichModalJsonRootPathModalBody)`
  margin-top: 50px;
  gap: 50px;

  .inputValue {
    margin-top: 40px;
    text-align: center;
  }

  p {
    text-align: justify;
  }
`;

export const EnrichJsonJoinTypeTableWrapper = styled.div`
  margin-top: 100px;

  img {
    display: block;
    margin: 0 auto;
  }

  p {
    margin-top: 20px;
    text-align: justify;
  }
`;
