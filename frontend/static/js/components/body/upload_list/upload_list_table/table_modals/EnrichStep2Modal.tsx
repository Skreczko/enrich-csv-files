import React, { useEffect, useState } from 'react';
import { CustomGenericModal } from '../../../CustomGenericModal';
import { truncateString } from '../../../../notification/helpers';
import { CsvFileElement, EnrichFileRequest, EnrichmentJoinType } from '../../../../../api/types';
import InfoImage from '../../../../../../img/notification/info.png';
import MergeImage from '../../../../../../img/body/list/merge.png';
import CsvImage from '../../../../../../img/body/list/csv.png';
import JsonImage from '../../../../../../img/body/list/json.png';
import FlattenedImage from '../../../../../../img/body/list/flatenned.png';
import {
  EnrichModalDescription,
  EnrichModalError,
  EnrichModalWrapper,
} from './EnrichStep1Modal.styled';
import {
  EnrichJoinTypeDescription,
  EnrichProcessSelectionWrapper,
  EnrichStep2CustomDropdownWrapper,
} from './EnrichStep2Modal.styled';
import { CustomDropdown } from '../../../CustomDropdown';
import { DropdownItemEnum, DropdownOptions } from '../../table_management/types';
import { useFetchUploadDetail } from '../../../../hooks/useFetchUploadDetail';
import { Spinner } from '../../../Spinner';
import { Checkbox, Popup } from 'semantic-ui-react';
import ErrorImage from '../../../../../../img/notification/error.png';
import QuestionMarkImage from '../../../../../../img/body/list/question-mark.png';
import { AdditionalInfoWrapper } from '../TableRowDetailSection.styled';

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
  onAction: ({
    flattenJson,
    selectedCsvHeader,
    selectedJoinType,
    selectedJsonKey,
  }: Omit<EnrichFileRequest, 'enrichDetailUuid'>) => void;
  onClose: () => void;
  setOpenJoinTypeModal: () => void;
  setOpenFlattenStructureModal: () => void;
  open: boolean;
  selectedFileElement: CsvFileElement;
};

export const EnrichStep2Modal: React.FC<Props> = ({
  onAction,
  onClose,
  open,
  selectedFileElement,
  setOpenJoinTypeModal,
  setOpenFlattenStructureModal,
}) => {
  const fetchDetailedData = useFetchUploadDetail();

  const [selectedCsvHeader, setSelectedCsvHeader] = useState<string>(null);
  const [selectedCsvHeaderError, setSelectedCsvHeaderError] = useState(false);
  const [selectedJsonKey, setSelectedJsonKey] = useState<string>(null);
  const [selectedJsonKeyError, setSelectedJsonKeyError] = useState(false);
  const [selectedJoinType, setSelectedJoinType] = useState<EnrichmentJoinType>(null);
  const [selectedJoinTypeError, setSelectedJoinTypeError] = useState(false);
  const [flattenJson, setFlattenJson] = useState(false);

  useEffect(() => {
    if (!selectedFileElement.fetchedDetailInfo) fetchDetailedData(selectedFileElement.uuid);
    if (!selectedCsvHeader)
      setSelectedCsvHeader(selectedFileElement?.source_instance?.file_headers?.[0]);
  }, [selectedFileElement]);

  const handleEnrichActionWithValidation = (): void => {
    if (!selectedCsvHeader) {
      setSelectedCsvHeaderError(true);
    }
    if (!selectedJsonKey) {
      setSelectedJsonKeyError(true);
    }
    if (!selectedJoinType) {
      setSelectedJoinTypeError(true);
    } else {
      onAction({
        selectedCsvHeader,
        selectedJoinType,
        selectedJsonKey,
        flattenJson,
      });
      onClose();
      // handleEnrichOnCLose();
      // setEnrichInputError(true);
    }
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
      onAction={handleEnrichActionWithValidation}
      header={`Enrich file data`}
      subHeader={`Step 2/2: Enrichment process`}
      actionLabel={'Enrich'}
      actionLabelColor={'green'}
      size={'large'}
    >
      <EnrichModalWrapper>
        <EnrichModalDescription>
          <img src={InfoImage} alt={'info'} />
          <p>
            Select CSV file <b>header</b> and external response <b>JSON key</b> to be connected in
            enrichment process. Select join type which define how csv file and external resposne
            should be connected.
          </p>
        </EnrichModalDescription>

        <EnrichProcessSelectionWrapper>
          <div className={'center'}>
            <img src={CsvImage} alt={'csvfile'} />
          </div>
          <img src={MergeImage} alt={'merge'} />
          <img src={FlattenedImage} alt={'flattenedimage'} />
          <div className={'center'}>
            <img src={JsonImage} alt={'jsonimage'} />
          </div>
        </EnrichProcessSelectionWrapper>
        <EnrichProcessSelectionWrapper>
          <div className={'center'}>
            <p>
              <b>{truncateString(selectedFileElement.source_original_file_name, 60)}</b>
            </p>
          </div>
          <div></div>
          <div></div>

          <div className={'center'}>
            <p>
              <b>{truncateString(selectedFileElement.enrich_detail.external_url, 60)}</b>
            </p>
          </div>
        </EnrichProcessSelectionWrapper>
        <EnrichProcessSelectionWrapper>
          <EnrichStep2CustomDropdownWrapper>
            {!selectedFileElement?.fetchedDetailInfo ? (
              <Spinner />
            ) : (
              <>
                <CustomDropdown
                  options={selectedFileElement.source_instance.file_headers.map(header => ({
                    type: DropdownItemEnum.OPTION,
                    value: header,
                    text: header,
                  }))}
                  value={selectedCsvHeader}
                  onClick={(value): void => {
                    setSelectedCsvHeader(value as string);
                    setSelectedCsvHeaderError(false);
                  }}
                  placeholderOnSelected={'Selected header:'}
                  placeholderOnChoice={'Csv headers'}
                  width={'100%'}
                />
                {selectedCsvHeaderError && (
                  <EnrichModalError>
                    <img src={ErrorImage} alt={'error'} />
                    <small>Select CSV file header</small>
                  </EnrichModalError>
                )}
              </>
            )}
          </EnrichStep2CustomDropdownWrapper>
          <EnrichStep2CustomDropdownWrapper>
            <CustomDropdown
              options={joinTypeOptions}
              value={selectedJoinType}
              onClick={(value): void => {
                setSelectedJoinType(value as EnrichmentJoinType);
                setSelectedJoinTypeError(false);
              }}
              placeholderOnSelected={'Selected join type:'}
              placeholderOnChoice={'Join type'}
              width={'100%'}
            />
            <img src={QuestionMarkImage} alt={'question'} onClick={setOpenJoinTypeModal} />
            {selectedJoinTypeError && (
              <EnrichModalError>
                <img src={ErrorImage} alt={'error'} />
                <small>Select join type</small>
              </EnrichModalError>
            )}
          </EnrichStep2CustomDropdownWrapper>
          <EnrichStep2CustomDropdownWrapper>
            <Checkbox
              label='Flatten JSON structure'
              checked={flattenJson}
              onChange={(e, { checked }): void => setFlattenJson(checked)}
            />
            <img src={QuestionMarkImage} alt={'question'} onClick={setOpenFlattenStructureModal} />
          </EnrichStep2CustomDropdownWrapper>
          <EnrichStep2CustomDropdownWrapper>
            {!selectedFileElement?.fetchedDetailInfo ? (
              <Spinner />
            ) : (
              <>
                <CustomDropdown
                  options={selectedFileElement.enrich_detail.external_elements_key_list.map(
                    jsonKey => ({
                      type: DropdownItemEnum.OPTION,
                      value: jsonKey,
                      text: jsonKey,
                    }),
                  )}
                  value={selectedJsonKey}
                  onClick={(value): void => {
                    setSelectedJsonKey(value as string);
                    setSelectedJsonKeyError(false);
                  }}
                  placeholderOnSelected={'Selected JSON key:'}
                  placeholderOnChoice={'JSON key'}
                  width={'100%'}
                />
                <Popup
                  content={
                    'Nested objects within your selected JSON key are not yet supported. We currently support only simple values such as strings and numbers.'
                  }
                  inverted
                  mouseEnterDelay={50}
                  position={'top right'}
                  size='mini'
                  trigger={<img src={InfoImage} alt={'info'} />}
                />
                {selectedJsonKeyError && (
                  <EnrichModalError>
                    <img src={ErrorImage} alt={'error'} />
                    <small>Select JSON key</small>
                  </EnrichModalError>
                )}
              </>
            )}
          </EnrichStep2CustomDropdownWrapper>
        </EnrichProcessSelectionWrapper>
        {/*{selectedJoinType && (*/}
        {/*  <EnrichJoinTypeDescription>*/}
        {/*    <img src={InfoImage} alt={'info'} />*/}
        {/*    <p>{joinTypeDescription(selectedJoinType)}</p>*/}
        {/*  </EnrichJoinTypeDescription>*/}
        {/*)}*/}
      </EnrichModalWrapper>
    </CustomGenericModal>
  );
};
