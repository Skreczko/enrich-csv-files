import styled from 'styled-components';
import { mainGreen } from '../../../../App.styled';

export const EnrichModalWrapper = styled.div`
  .file {
    margin: 40px 0;
  }
`;

export const EnrichModalDescription = styled.div`
  display: flex;
  gap: 20px;

  img {
    height: 20px;
    width: 20px;
  }
`;

export const EnrichModalURLInput = styled.input`
  font-size: 14px;
  padding: 13px;
  border: 1px solid darkgray;
  width: 70%;
  &:focus {
    border: 1px solid ${mainGreen};
    outline: none;
  }
`;
