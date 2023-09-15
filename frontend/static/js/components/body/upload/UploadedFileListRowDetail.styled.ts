import styled from 'styled-components';
import { mainGreen } from '../../../App.styled';

export const ProgressBar = styled.div<{ height?: number; backgroundColor?: string }>`
  width: 100%;
  background-color: ${({ backgroundColor }): string =>
    backgroundColor ? `${backgroundColor}` : 'transparent'};
  height: ${({ height }): string => (height ? `${height}px` : 'inherit')};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
  border: 1px solid black;
`;

export const FileName = styled.p<{ color: string; fontSize?: number }>`
  z-index: 2;
  color: ${({ color }): string => `${color}`};
  font-size: ${({ fontSize }): string => (fontSize ? `${fontSize}px` : 'inherit')};
  padding: 2px 0 2px 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const ProgressBarFiller = styled.div<{ width: number; backgroundColor?: string }>`
  height: 100%;
  background-color: ${({ backgroundColor }): string =>
    backgroundColor ? `${backgroundColor}` : `${mainGreen}`};
  position: absolute;
  left: 0;
  top: 0;
  width: ${({ width }): string => `${width}%`};
  z-index: 1;
  transition: 1s linear;
`;

export const UploadStatusImageWrapper = styled.div`
  display: flex;
  align-items: center;
  img {
    height: 20px;
    width: 20px;
    margin-right: 10px;
    cursor: pointer;
  }
`;
