import styled from 'styled-components';
import { lightGrey } from '../../../../App.styled';

export const DetailWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 2px solid ${lightGrey};
  > div {
    padding: 20px 40px;
    border-right: 2px solid ${lightGrey};
  }
`;

export const DetailElementWrapper = styled.div`
  padding: 20px 40px;
  border-right: 2px solid ${lightGrey};
`;

export const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 10px;
  font-size: 12px;
`;
