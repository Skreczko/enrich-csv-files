import styled from 'styled-components';
import { tableMainColor, tableTextColor } from '../../../../App.styled';

export const CustomTable = styled.div`
  width: 100%;
  text-transform: uppercase;
`;
export const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 20% 10% 10% 30% 20% 10%;
`;

interface TableRowProps {
  color?: string;
}

export const TableRow = styled(TableGrid)<TableRowProps>`
  background-color: #fff;
  color: ${({ color }): string => (color ? color : tableTextColor)};
  font-size: 14px;
  padding: 0;
  margin-top: 0;
  height: 35px;
  border-bottom: 2px solid ${tableMainColor};
  position: relative;
`;
export const TableRowFullWidth = styled(TableRow)`
  grid-template-columns: 1fr;
  min-height: 200px;
  border-bottom: none;
`;
