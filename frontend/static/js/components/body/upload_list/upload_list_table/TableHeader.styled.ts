import styled from 'styled-components';
import { tableMainColor } from '../../../../App.styled';
import { TableGrid } from './UploadListTable.styled';

export const TableHeaderWrapper = styled(TableGrid)`
  width: 100%;
  text-transform: uppercase;
  background-color: ${tableMainColor};
  color: #fff;
  font-size: 12px;
  padding: 15px 0;
  font-weight: 400;
`;
export const TableHeaderCell = styled.div`
  display: flex;
  justify-content: center;
`;
