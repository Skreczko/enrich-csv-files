import styled from 'styled-components';
import { TableRowWrapper } from './UploadTable.styled';

export const CsvElementRow = styled(TableRowWrapper)``;

interface RowCellProps {
  centred?: boolean;
  pointer?: boolean;
}

export const RowCell = styled.div<RowCellProps>`
  display: flex;
  justify-content: ${({ centred }): string => (centred ? 'center' : ' flex-start')};
  align-items: center;
  padding-left: ${({ centred }): string => (centred ? '0' : ' 10px')};
  cursor: ${({ pointer }): string => (pointer ? 'pointer' : ' inherit')};

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
  }
`;
