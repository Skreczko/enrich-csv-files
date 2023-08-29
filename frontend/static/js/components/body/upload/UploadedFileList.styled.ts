import styled from 'styled-components';

export const UploadedFileListWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 50px;
  overflow: auto;
  flex-grow: 1;
`;

export const FileListWrapper = styled.div`
  display: grid;
  grid-template-columns: 400px 100px 100px;
  align-items: center;
  grid-gap: 5px;

  div {
    overflow-wrap: break-word;
  }

  img {
    height: 20px;
    width: 20px;
    cursor: pointer;
  }
`;
