import styled from 'styled-components';
import { TableRowContainer } from './UploadTable.styled';
import { tableMainColor } from '../../../../App.styled';

export const TableRowWrapper = styled.div`
  border-bottom: 2px solid ${tableMainColor};
  transition: 1s linear;
`;

export const CsvElementRow = styled(TableRowContainer)`
  height: auto;
  min-height: 35px;
`;

interface TableCellProps {
  centred?: boolean;
  pointer?: boolean;
  column?: boolean;
  paddingLeft?: number;
}

export const TableCell = styled.div<TableCellProps>`
  display: flex;
  flex-direction: ${({ column }): string => (column ? 'column' : ' row')};
  justify-content: ${({ centred }): string => (centred ? 'center' : ' flex-start')};
  align-items: center;
  padding-left: ${({ paddingLeft }): string => (paddingLeft ? `${paddingLeft}px` : ' 0')};
  cursor: ${({ pointer }): string => (pointer ? 'pointer' : ' inherit')};

  a {
    text-decoration: none;
    color: inherit;
    background-color: transparent;
    cursor: pointer;
  }
  p {
    text-transform: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &.padding-left {
      padding-left: 10px;
    }
  }

  img {
    height: 12px;
    width: 12px;
    margin-right: 5px;
  }
`;

export const PopupTrigger = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  padding: 0 10px;
`;
