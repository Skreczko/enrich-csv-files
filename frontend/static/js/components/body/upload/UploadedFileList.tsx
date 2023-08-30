import React from 'react';
import { CustomButton } from '../../utils/CustomButton.styled';
import { FileListWrapper, UploadedFileListWrapper } from './UploadedFileList.styled';
import DeleteImage from '../../../../img/body/upload/delete.png';

interface Props {
  files: File[];
  onFileRemove: (name: string) => void;
  onSend: () => void;
}

export const UploadedFileList: React.FC<Props> = ({ files, onFileRemove, onSend }) => {
  console.log(files);
  return (
    <UploadedFileListWrapper>
      <FileListWrapper>
        {files.map(({ name, size }) => (
          <>
            <div key={name}>{name}</div>
            <div>({(size / 1024 ** 2).toFixed(2)} MB)</div>

            <div onClick={(): void => onFileRemove(name)}>
              <img src={DeleteImage} alt={'delete'} />
            </div>
          </>
        ))}
      </FileListWrapper>
      <CustomButton onClick={onSend}>
        <p>upload</p>
      </CustomButton>
    </UploadedFileListWrapper>
  );
};
