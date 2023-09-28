import { CSSProperties } from 'react';
import styled from 'styled-components';

export const PreviewWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export const CellContentStyle: CSSProperties = {
  whiteSpace: 'normal',
  padding: '5px 10px',
  overflow: 'auto',
  outline: '1px solid #222',
};

export const HeaderCellStyle: CSSProperties = {
  padding: '5px 10px',
  overflow: 'auto',
  outline: '1px solid #222',
  backgroundColor: 'lightgray',
  fontWeight: 'bold',
};
