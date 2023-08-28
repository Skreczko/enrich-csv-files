import React, { useRef } from 'react';
import { HiddenUploadInput, UploadButton } from './UploadFileButton.styled';

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
    <UploadButton onClick={handleClick}>
      <p>Click to upload</p>
      <HiddenUploadInput ref={inputRef} type='file' multiple onChange={handleFileInput} />
    </UploadButton>
  );
};
