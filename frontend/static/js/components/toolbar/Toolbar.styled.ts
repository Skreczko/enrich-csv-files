import styled from 'styled-components';

export const ToolbarWrapper = styled.div`
  width: 200px;
  min-height: 100vh;
  background-color: #1b2028;
  flex-shrink: 0;
`;

export const NavLink = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  margin: 10px 0;
  height: 30px;
  color: white;
  cursor: pointer;
  transition: 0.3s linear;
  border-left: ${({ active }): string => (active ? '5px solid green' : 'none')};
  padding: ${({ active }): string => (active ? '0 10px 0 15px' : ' 0 10px')};
  p {
    font-size: 14px;
    margin-left: 10px;
  }
  img {
    height: 14px;
    width: 14px;
  }
`;
