import styled from 'styled-components';
import { TableRowWrapper } from './UploadTable.styled';

export const CsvElementRow = styled(TableRowWrapper)`
  height: auto;
  min-height: 35px;
`;

interface RowCellProps {
  centred?: boolean;
  pointer?: boolean;
  column?: boolean;
  paddingLeft?: number;
}

export const RowCell = styled.div<RowCellProps>`
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
    word-break: break-word;
    text-transform: none;

    &.padding-left {
      padding-left: 10px;
    }
  }
  img {
    height: 12px;
    width: 12px;
    margin-right: 5px;
    &.preview {
      height: 18px;
      width: 18px;
      margin-right: 0;
    }
  }
`;

export const PopupTrigger = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  padding: 0 10px;
`
