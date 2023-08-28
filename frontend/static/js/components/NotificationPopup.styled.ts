import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const NotificationWrapper = styled.div<{ open: boolean }>`
  display: ${({ open }): string => (open ? 'flex' : 'none')};
  flex-direction: column;
  gap: 2px;
  position: fixed;
  top: 0;
  left: 200px;
  right: 0;
  z-index: 2;
  > div.message {
    margin: 0;
    animation: ${slideDown} 200ms ease-in-out;
  }
`;

export const MessageHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  p {
    margin: 0 !important; // force override semantic style
  }
  div {
    padding: 5px 15px;
    border: 2px solid currentColor;
    cursor: pointer;
  }
`;
