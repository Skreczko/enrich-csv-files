import React, { useState } from 'react';
import { CustomGenericModal } from '../../CustomGenericModal';
import { truncateString } from '../../../notification/helpers';
import { CsvFileElement } from '../../../../api/types';
import {
  EnrichModalDescription,
  EnrichModalURLInput,
  EnrichModalWrapper,
} from './TableModals.style';
import InfoImage from '../../../../../img/notification/info.png';
// import validator from 'validator'

type Props = {
  selectedFileElement: CsvFileElement;
  openDeleteModal: boolean;
  onCloseDeleteModal: () => void;
  onDeleteAction: () => void;
  openEnrichModal: boolean;
  onCloseEnrichModal: () => void;
  onEnrichAction: () => void;
};

export const TableModals: React.FC<Props> = ({
  selectedFileElement,
  openDeleteModal,
  onCloseDeleteModal,
  onDeleteAction,
  openEnrichModal,
  onCloseEnrichModal,
  onEnrichAction,
}) => {
  const [enrichInputValue, setEnrichInputValue] = useState<string>('');
  const [enrichInputError, setEnrichInputError] = useState(false);

  const handleEnrichInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    setEnrichInputValue(value);
  };

  const handleEnrichActionWithValidation = (): void => {
    // if (validator.isURL(enrichInputValue)) {
    //   onEnrichAction();
    // } else {
    //   setEnrichInputError(true);
    // }
  };

  return (
    <>
      {openDeleteModal && (
        <CustomGenericModal
          open={openDeleteModal}
          onClose={onCloseDeleteModal}
          onAction={onDeleteAction}
          header={'Delete CSV record'}
          actionLabel={'Delete'}
          actionLabelColor={'red'}
        >
          <p>
            Are you sure you want to delete{' '}
            <b>{truncateString(selectedFileElement.original_file_name, 60)}</b>?
          </p>
        </CustomGenericModal>
      )}
      {openEnrichModal && (
        <CustomGenericModal
          open={openEnrichModal}
          onClose={onCloseEnrichModal}
          onAction={handleEnrichActionWithValidation}
          header={`Enrich file data`}
          subHeader={`Step 1/2: Provide external URL`}
          actionLabel={'Process'}
          actionLabelColor={'blue'}
        >
          <EnrichModalWrapper>
            <EnrichModalDescription>
              <img src={InfoImage} alt={'info'} />
              <p>
                Input an API endpoint to fetch external details. The endpoint should return a
                response in application/json format. Other formats and empty lists will be rejected.
                The enriched data will create a new file, preserving the original.
              </p>
            </EnrichModalDescription>
            <p className={'file'}>
              File: <b>{truncateString(selectedFileElement.original_file_name, 60)}</b>
            </p>
            <EnrichModalURLInput
              type='url'
              placeholder='Enter API endpoint'
              value={enrichInputValue}
              onChange={handleEnrichInputChange}
            />
            <small>Invalid URL format</small>
          </EnrichModalWrapper>
        </CustomGenericModal>
      )}
    </>
  );
};
