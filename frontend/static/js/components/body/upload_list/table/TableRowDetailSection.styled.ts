import styled from 'styled-components';
import { lightGrey } from '../../../../App.styled';

export const DetailWrapper = styled.div`
  border-top: 2px solid ${lightGrey};
  > div {
    padding: 20px 40px;

    &:last-child {
      border-right: none;
    }
  }
`;

export const DetailElementWrapper = styled.div`
  padding: 20px 40px;

  h5 {
    margin-bottom: 20px;
  }
`;

export const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 10px;
  font-size: 12px;
`;
