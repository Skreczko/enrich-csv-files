import React, { useState } from 'react';
import { CustomGenericModal } from '../../../CustomGenericModal';
import { truncateString } from '../../../../notification/helpers';
import { CsvFileElement } from '../../../../../api/types';
import InfoImage from '../../../../../../img/notification/info.png';
import ErrorImage from '../../../../../../img/notification/error.png';
import QuestionMarkImage from '../../../../../../img/body/list/question-mark.png';
import isURL from 'validator/lib/isURL';
import {
  EnrichModalDescription,
  EnrichModalError,
  EnrichModalJsonRootInput,
  EnrichModalJsonRootWrapper,
  EnrichModalURLInput,
  EnrichModalWrapper,
} from './EnrichStep1Modal.styled';

type Props = {
  onAction: (enrichUrl: string, jsonRootPath: string) => void;
  onClose: () => void;
  onOpenEnrichJsonRootPathModal: () => void;
  open: boolean;
  selectedFileElement: CsvFileElement;
};

export const EnrichStep1Modal: React.FC<Props> = ({
  onAction,
  onClose,
  onOpenEnrichJsonRootPathModal,
  open,
  selectedFileElement,
}) => {
  const [enrichInputValue, setEnrichInputValue] = useState<string>('');
  const [enrichJsonRootPath, setEnrichJsonRootPath] = useState<string>('');
  const [enrichInputError, setEnrichInputError] = useState(false);

  const handleEnrichUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    if (enrichInputError) setEnrichInputError(false);
    setEnrichInputValue(value);
  };

  const handleEnrichJsonKeyChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    setEnrichJsonRootPath(value);
  };

  const handleEnrichActionWithValidation = (): void => {
    onAction(enrichInputValue, enrichJsonRootPath);
      handleEnrichOnCLose();
    // if (isURL(enrichInputValue)) {
    //   onAction(enrichInputValue, enrichJsonRootPath);
    //   handleEnrichOnCLose();
    // } else {
    //   setEnrichInputError(true);
    // }
  };

  const handleEnrichOnCLose = (): void => {
    setEnrichInputError(false);
    setEnrichInputValue('');
    onClose();
  };

  return (
    <CustomGenericModal
      open={open}
      onClose={handleEnrichOnCLose}
      onAction={handleEnrichActionWithValidation}
      header={`Enrich file data`}
      subHeader={`Step 1/2: Provide external URL`}
      actionLabel={'Process'}
      actionLabelColor={'green'}
    >
      <EnrichModalWrapper>
        <EnrichModalDescription>
          <img src={InfoImage} alt={'info'} />
          <p>
            Input an API endpoint to fetch external details. The endpoint should return a response
            in application/json format. Other formats and empty lists will be rejected. The enriched
            data will create a new file, preserving the original.
          </p>
        </EnrichModalDescription>
        <p className={'file'}>
          File: <b>{truncateString(selectedFileElement.original_file_name, 60)}</b>
        </p>
        <EnrichModalURLInput
          type='url'
          placeholder='Enter API endpoint'
          value={enrichInputValue}
          onChange={handleEnrichUrlInputChange}
        />
        {enrichInputError && (
          <EnrichModalError>
            <img src={ErrorImage} alt={'error'} />
            <small>Invalid URL format</small>
          </EnrichModalError>
        )}
        <EnrichModalJsonRootWrapper>
          <EnrichModalJsonRootInput
            type='text'
            placeholder='Enter URL JSON root path'
            value={enrichJsonRootPath}
            onChange={handleEnrichJsonKeyChange}
          />
          <img src={QuestionMarkImage} alt={'question'} onClick={onOpenEnrichJsonRootPathModal} />
        </EnrichModalJsonRootWrapper>
      </EnrichModalWrapper>
    </CustomGenericModal>
  );
};
