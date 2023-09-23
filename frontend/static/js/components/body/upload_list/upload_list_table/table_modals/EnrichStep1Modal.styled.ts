import styled from 'styled-components';
import { mainGreen } from '../../../../../App.styled';

export const EnrichModalWrapper = styled.div`
  .file {
    margin: 40px 0;
  }
`;

export const EnrichModalDescription = styled.div`
  display: flex;
  align-items: flex-start;
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

export const EnrichModalError = styled.div`
  display: flex;
  align-items: center;
  color: red;
  img {
    height: 12px !important;
    width: 12px !important;
    margin-right: 5px;
  }
`;

export const EnrichModalJsonRootWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;

  img {
    height: 20px;
    width: 20px;
    margin-left: 10px;
    cursor: pointer;
  }
`;

export const EnrichModalJsonRootInput = styled(EnrichModalURLInput)`
  width: 35%;
`;
