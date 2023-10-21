import React from 'react';
import { CustomGenericModal } from '../../../CustomGenericModal';
import { truncateString } from '../../../../notification/helpers';
import { CsvFileElement } from '../../../../../api/types';

type Props = {
  onAction: () => Promise<void>;
  onClose: () => void;
  open: boolean;
  selectedFileElement: CsvFileElement;
};

export const DeleteModal: React.FC<Props> = ({ onAction, onClose, open, selectedFileElement }) => (
  <CustomGenericModal
    open={open}
    onClose={onClose}
    onAction={(): void => {
      onAction();
      onClose();
    }}
    header={'Delete CSV record'}
    actionLabel={'Delete'}
    actionLabelColor={'red'}
    testId={'delete-modal'}
  >
    <p data-testid={'delete-modal-text'}>
      Are you sure you want to delete{' '}
      <b>{truncateString(selectedFileElement.original_file_name, 60)}</b>?
    </p>
  </CustomGenericModal>
);
