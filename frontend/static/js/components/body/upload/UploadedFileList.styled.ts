import styled from 'styled-components';

export const UploadedFileListWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 50px;
  overflow: auto;
  flex-grow: 1;
  padding-left: 10px;
`;

export const FileListWrapper = styled.div`
  display: grid;
  grid-template-columns: 400px 100px 100px;
  align-items: center;
  grid-gap: 5px;
  position: relative;
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

export const ProgressBar = styled.div`
  width: 100%;
  background-color: transparent;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
`;

export const FileName = styled.p<{ color: string }>`
  z-index: 2;
  color: ${({ color }): string => `${color}`};
  padding: 2px 0 2px 10px;
  word-break: break-word;
`;

export const ProgressBarFiller = styled.div<{ width: number }>`
  height: 100%;
  background-color: #4bc5ac;
  position: absolute;
  left: 0;
  top: 0;
  width: ${({ width }): string => `${width}%`};
  z-index: 1;
`;
