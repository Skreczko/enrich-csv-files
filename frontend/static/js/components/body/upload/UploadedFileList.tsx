import React, {useEffect, useState} from 'react';
import { CustomButton } from '../../utils/CustomButton.styled';
import { FileListWrapper, UploadedFileListWrapper } from './UploadedFileList.styled';
import DeleteImage from '../../../../img/body/upload/delete.png';
import { FileType } from './UploadFile';

interface Props {
  files: FileType[];
  onFileRemove: (name: string) => void;
  onSend: () => void;
}

export const UploadedFileList: React.FC<Props> = ({ files, onFileRemove, onSend }) => {
  const [currentFiles, setCurrentFiles] = useState<FileType[]>(files);

  useEffect(() => {
      setCurrentFiles(files)
  }, [files])

  return (
    <UploadedFileListWrapper>
      <FileListWrapper>
        {currentFiles.map(fileElement => {
          const { name, size } = fileElement.file;
          return (
            <>
              <div key={name}>
                {name} ({fileElement.streaming_value})
              </div>
              <div>({(size / 1024 ** 2).toFixed(2)} MB)</div>

              <div onClick={(): void => onFileRemove(name)}>
                <img src={DeleteImage} alt={'delete'} />
              </div>
            </>
          );
        })}
      </FileListWrapper>
      <CustomButton onClick={onSend}>
        <p>upload</p>
      </CustomButton>
    </UploadedFileListWrapper>
  );
};
