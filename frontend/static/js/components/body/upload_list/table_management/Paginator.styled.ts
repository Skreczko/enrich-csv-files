import styled from 'styled-components';
import ReactPaginate from 'react-paginate';
import { mainDisabled, mainGreen, tableMainColor } from '../../../../App.styled';

export const PaginatorWrapper = styled(ReactPaginate)`
  display: flex;
  justify-content: center;
  list-style-type: none !important;
  margin-top: 50px;

  .page {
    border: 1px solid white;
    border-left: unset;
    background-color: ${tableMainColor};
    cursor: pointer;

    &:nth-child(1) {
      border-left: 1px solid white;
    }

    a {
      display: block;
      padding: 5px 10px;
      color: white;
      font-weight: 400;
      font-size: 12px;
      text-transform: uppercase;
    }

    &.active {
      background-color: ${mainGreen};
    }

    &.disabled {
      cursor: not-allowed;
      background-color: ${mainDisabled};
    }
  }
`;
