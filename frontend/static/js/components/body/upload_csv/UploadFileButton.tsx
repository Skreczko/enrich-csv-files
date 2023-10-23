import React, { useRef } from 'react';
import { CustomButton, HiddenUploadInput } from '../CustomButton.styled';

type Props = {
  onAdd: (file: File[]) => void;
};

export const UploadFileButton: React.FC<Props> = ({ onAdd }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (): void => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onAdd(Array.from(e.target.files));

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <CustomButton data-testid={'upload-file-button'} onClick={handleClick} margin={'50px 0 0 0'}>
      <p>add file</p>
      <HiddenUploadInput
        data-testid={'upload-file-hidden-upload-input'}
        ref={inputRef}
        type='file'
        multiple
        onChange={handleFileInput}
      />
    </CustomButton>
  );
};
