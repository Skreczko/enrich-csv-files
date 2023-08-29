import React, { useRef } from 'react';
import { CustomButton, HiddenUploadInput } from '../../utils/CustomButton.styled';

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
    <CustomButton onClick={handleClick} margin={'50px 0 0 0'}>
      <p>add file</p>
      <HiddenUploadInput ref={inputRef} type='file' multiple onChange={handleFileInput} />
    </CustomButton>
  );
};
