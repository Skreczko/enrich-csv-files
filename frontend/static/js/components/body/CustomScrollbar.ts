const scrollbarColor = '#84b1b5';
const scrollbarWidth = '6px';
const scrollbarHeight = '6px';

export const customScrollbar = `
  &::-webkit-scrollbar {
    width: ${scrollbarWidth};
    height: ${scrollbarHeight};
  }
  &::-webkit-scrollbar-track {
    border-radius: 5px;
  }
  &::-webkit-scrollbar-button {
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${scrollbarColor};
    box-shadow: inset 2px 2px 5px 0 rgba(255, 255, 255, 0.5);
    border-radius: 100px;
  }
`;
