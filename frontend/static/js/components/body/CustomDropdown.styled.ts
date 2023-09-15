import styled from 'styled-components';
import { mainGreen, tableMainColor } from '../../App.styled';

export const CustomDropdownWrapper = styled.div<{ width?: string }>`
  font-size: 12px !important;

  .ui.dropdown {
    padding: 5px 10px;
    border: 1px solid lightgray;
    width: ${({ width }): string => width ?? '100px'} !important;
  }

  .item {
    font-size: 14px !important;

    &.selected {
      color: white !important;
      font-weight: bold !important;
      background-color: ${mainGreen} !important;
    }
  }

  .menu {
    border: 1px solid ${tableMainColor} !important;

    .header {
      background-color: ${tableMainColor} !important;
      margin: 0 !important;
      padding: 5px !important;
      color: white !important;
    }
  }
`;
