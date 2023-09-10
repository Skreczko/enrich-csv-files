import styled from 'styled-components';
import { mainGreen } from '../../../../App.styled';

export const SearchInputWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin: 30px 0;
`;

export const SearchIconWrapper = styled.div`
  height: 100%;
  background-color: ${mainGreen};
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 0 20px 20px 0;
  padding: 12px 20px;

  img {
    max-height: 23px;
  }
`;

export const StyledInput = styled.input`
  font-size: 14px;
  padding: 13px;
  border: 1px solid darkgray;
  border-right: none;
  border-radius: 15px 0 0 15px;
  width: 250px;
  max-width: 320px;

  &:focus {
    border: 1px solid ${mainGreen};
    border-right: none;
    outline: none;
  }
`;
