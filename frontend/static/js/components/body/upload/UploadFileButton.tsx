import React, { useRef } from 'react';

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
    <div>
      <button onClick={handleClick} style={{ marginTop: '10px' }}>
        Add CSV file
      </button>
      <input
        ref={inputRef}
        type='file'
        multiple
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );
};
