import React, { useEffect, useState } from 'react';
import { CustomGenericModal } from '../../../CustomGenericModal';
import { truncateString } from '../../../../notification/helpers';
import { CsvFileElement, EnrichmentJoinType } from '../../../../../api/types';
import InfoImage from '../../../../../../img/notification/info.png';
import { EnrichModalDescription, EnrichModalWrapper } from './EnrichStep1Modal.styled';
import {
  EnrichJoinTypeDescription,
  EnrichProcessSelectionWrapper,
} from './EnrichStep2Modal.styled';
import { CustomDropdown } from '../../../CustomDropdown';
import { DropdownItemEnum, DropdownOptions } from '../../table_management/types';
import { useFetchUploadDetail } from '../../../../hooks/useFetchUploadDetail';
import { Spinner } from '../../../Spinner';
import MergeImage from '../../../../../../img/body/list/merge.png';

const joinTypeOptions: DropdownOptions[] = [
  { type: DropdownItemEnum.OPTION, value: EnrichmentJoinType.LEFT, text: 'Left' },
  { type: DropdownItemEnum.OPTION, value: EnrichmentJoinType.RIGHT, text: 'Right' },
  { type: DropdownItemEnum.OPTION, value: EnrichmentJoinType.INNER, text: 'Inner' },
];

const joinTypeDescription = (joinType: EnrichmentJoinType): string => {
  switch (joinType) {
    case EnrichmentJoinType.LEFT:
      return 'Includes all records from the source CSV file and matched records from the external URL response.';
    case EnrichmentJoinType.RIGHT:
      return 'Includes all records from the external URL response and matched records from the source CSV file.';
    case EnrichmentJoinType.INNER:
      return 'Only includes records that have matching values in both the source CSV file and the external URL response.';
  }
};

type Props = {
  onAction: (enrichUrl: string, jsonRootPath: string) => void;
  onClose: () => void;
  open: boolean;
  selectedFileElement: CsvFileElement;
};

export const EnrichStep2Modal: React.FC<Props> = ({
  onAction,
  onClose,
  open,
  selectedFileElement,
}) => {
  const fetchDetailedData = useFetchUploadDetail();
  const [selectedCsvHeader, setSelectedCsvHeader] = useState<string>(null);
  const [selectedJsonKey, setSelectedJsonKey] = useState<string>(null);
  const [selectedJoinType, setSelectedJoinType] = useState<EnrichmentJoinType>(null);

  useEffect(() => {
    if (!selectedFileElement.fetchedDetailInfo) fetchDetailedData(selectedFileElement.uuid);
    if (!selectedCsvHeader)
      setSelectedCsvHeader(selectedFileElement?.source_instance?.file_headers?.[0]);
  }, [selectedFileElement]);

  const handleEnrichActionWithValidation = (): void => {
    // if (isURL(enrichInputValue)) {
    //   onAction(enrichInputValue, enrichJsonRootPath);
    //   handleEnrichOnCLose();
    // } else {
    //   setEnrichInputError(true);
    // }
  };

  const handleEnrichOnCLose = (): void => {
    // setEnrichInputError(false);
    // setEnrichInputValue('');
    onClose();
  };

  return (
    <CustomGenericModal
      open={open}
      onClose={onClose}
      onAction={(): void => console.log(1111111)}
      header={`Enrich file data`}
      subHeader={`Step 2/2: Enrichment process`}
      actionLabel={'Enrich'}
      actionLabelColor={'green'}
    >
      <EnrichModalWrapper>
        <EnrichModalDescription>
          <img src={InfoImage} alt={'info'} />
          <p>
            Select csv file <b>header</b> and external response <b>JSON key</b> to be connected in
            enrichment process. Select join type which define how csv file and external resposne
            should be connected.
          </p>
        </EnrichModalDescription>

        <EnrichProcessSelectionWrapper>
          <div className={'center'}>
            <p>File: </p>
            <p>
              <b>{truncateString(selectedFileElement.source_original_file_name, 60)}</b>
            </p>
          </div>
          <img src={MergeImage} alt={'merge'} />
          <img src={MergeImage} alt={'merge'} />
          <div className={'center'}>
            <p>URL address: </p>
            <p>
              <b>{truncateString(selectedFileElement.enrich_detail.external_url, 60)}</b>
            </p>
          </div>
        </EnrichProcessSelectionWrapper>
        <EnrichProcessSelectionWrapper>
          <div>
            {!selectedFileElement?.fetchedDetailInfo ? (
              <Spinner />
            ) : (
              <CustomDropdown
                options={selectedFileElement.source_instance.file_headers.map(header => ({
                  type: DropdownItemEnum.OPTION,
                  value: header,
                  text: header,
                }))}
                value={selectedCsvHeader}
                onClick={(value): void => setSelectedCsvHeader(value as string)}
                placeholderOnSelected={'Selected header:'}
                placeholderOnChoice={'Csv headers'}
              width={'100%'}
              />
            )}
          </div>
          <div>
            <CustomDropdown
              clearable={true}
              options={joinTypeOptions}
              value={selectedJoinType}
              onClick={(value): void => setSelectedJoinType(value as EnrichmentJoinType)}
              placeholderOnSelected={'Selected join type:'}
              placeholderOnChoice={'Join type'}
              width={'100%'}
            />
          </div>
          <div>isflat</div>
          <div>
            {!selectedFileElement?.fetchedDetailInfo ? (
              <Spinner />
            ) : (
              <CustomDropdown
                options={selectedFileElement.enrich_detail.external_elements_key_list.map(
                  jsonKey => ({
                    type: DropdownItemEnum.OPTION,
                    value: jsonKey,
                    text: jsonKey,
                  }),
                )}
                value={selectedJsonKey}
                onClick={(value): void => setSelectedJsonKey(value as string)}
                placeholderOnSelected={'Selected JSON key:'}
                placeholderOnChoice={'JSON key'}
              width={'100%'}
              />
            )}
          </div>
        </EnrichProcessSelectionWrapper>
        {selectedJoinType && (
          <EnrichJoinTypeDescription>
            <img src={InfoImage} alt={'info'} />
            <p>{joinTypeDescription(selectedJoinType)}</p>
          </EnrichJoinTypeDescription>
        )}
      </EnrichModalWrapper>
    </CustomGenericModal>
  );
};
