import styled from 'styled-components';
import { TableCell } from './TableRow.styled';
import { mainGreen } from '../../../../App.styled';

export const TableCellActionsWrapper = styled(TableCell)`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  gap: 15px;

  img {
    cursor: pointer;
    &.delete {
      height: 18px;
      width: 18px;
    }

    &.preview {
      height: 18px;
      width: 18px;
    }
  }
`;

export const EnrichButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  width: 60px;
  padding: 0 10px;
  background-color: ${mainGreen};
  cursor: pointer;
  h5 {
    color: white;
    text-transform: uppercase;
    font-size: 9px;
  }
`;
