import styled from 'styled-components';
import { mainGreen } from '../../../App.styled';

export const ProgressBar = styled.div`
  width: 100%;
  background-color: transparent;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
  border: 1px solid black;
`;

export const FileName = styled.p<{ color: string }>`
  z-index: 2;
  color: ${({ color }): string => `${color}`};
  padding: 2px 0 2px 10px;
  word-break: break-word;
`;

export const ProgressBarFiller = styled.div<{ width: number }>`
  height: 100%;
  background-color: ${mainGreen};
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
