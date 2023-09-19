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

export const EnrichModalError = styled.div`
  display: flex;
  align-items: center;
  color: red;
  img {
    height: 12px;
    width: 12px;
    margin-right: 5px;
  }
`;

export const EnrichModalJsonRootPathModalBody = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 10px;
  justify-content: left;
  align-items: center;

  code {
    font-size: 14px;
  }

  .inputValue {
    margin-top: 20px;
  }

  span {
    font-weight: bold;
    color: red;
  }
`;
