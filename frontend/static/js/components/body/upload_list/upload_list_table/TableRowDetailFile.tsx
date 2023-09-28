import React from 'react';
import {
  AdditionalInfoWrapper,
  DetailElementWrapper,
  DetailRow,
} from './TableRowDetailSection.styled';
import { EnrichmentJoinType, FileDetail } from '../../../../api/types';
import ErrorImage from '../../../../../img/notification/error.png';
import SuccessImage from '../../../../../img/notification/success.png';
import InfoImage from '../../../../../img/notification/info.png';
import { Popup } from 'semantic-ui-react';
import moment from 'moment';

type Props = {
  created: string;
  file: FileDetail;
  fileHeaders: string[];
  fileName: string;
  fileRows: number;
  isFlat?: boolean;
  joinType?: EnrichmentJoinType;
  jsonRootPath?: string;
  selectedHeader?: string;
  selectedKey?: string;
  showJsonRootPath: boolean;
  uuid: string;
};

export const TableRowDetailFile: React.FC<Props> = ({
  created,
  file,
  fileHeaders,
  fileName,
  fileRows,
  isFlat,
  joinType,
  jsonRootPath,
  selectedHeader,
  selectedKey,
  showJsonRootPath,
  uuid,
}) => (
  <DetailElementWrapper>
    <h5>File details</h5>
    <DetailRow>
      <p>id</p>
      <p className={'text-transform-none'}>{uuid}</p>
    </DetailRow>
    <DetailRow>
      <p>created</p>
      <p className={'text-transform-none'}>{moment(created).format('HH:mm YYYY-MM-DD')}</p>
    </DetailRow>
    <DetailRow>
      <p>file name</p>
      <p className={'text-transform-none'}>{fileName ?? 'In progress...'}</p>
    </DetailRow>
    <DetailRow>
      <p>size</p>
      {file ? (
        <p className={'text-transform-none'}>{(file?.size / 1024 ** 2).toFixed(2)} MB</p>
      ) : (
        <p className={'text-transform-none'}>In progress...</p>
      )}
    </DetailRow>
    <DetailRow>
      <p>file headers</p>
      <p className={'text-transform-none'}>
        {fileHeaders ? fileHeaders?.join(', ') : 'In progress...'}
      </p>
    </DetailRow>
    <DetailRow>
      <p>file rows</p>
      <p className={'text-transform-none'}>{fileRows ?? 'In progress...'}</p>
    </DetailRow>
    {joinType && (
      <DetailRow>
        <Popup
          content={
            <>
              <p>Join Types:</p>
              <br />
              <p>- LEFT</p>
              <p>
                Includes all records from the source CSV file and matched records from the external
                URL response.
              </p>
              <br />
              <p>- RIGHT</p>
              <p>
                Includes all records from the external URL response and matched records from the
                source CSV file.
              </p>
              <br />
              <p>- INNER</p>
              <p>
                Only includes records that have matching values in both the source CSV file and the
                external URL response.
              </p>
            </>
          }
          inverted
          mouseEnterDelay={50}
          position={'top left'}
          size='mini'
          trigger={
            <AdditionalInfoWrapper>
              <img src={InfoImage} />
              <p>join type</p>
            </AdditionalInfoWrapper>
          }
        />
        <p>{joinType}</p>
      </DetailRow>
    )}
    {joinType && (
      <DetailRow>
        <Popup
          content={
            'If the external response JSON contains nested dictionaries, they will be flattened and added to the CSV file columns.'
          }
          inverted
          mouseEnterDelay={50}
          position={'top left'}
          size='mini'
          trigger={
            <AdditionalInfoWrapper>
              <img src={InfoImage} />
              <p>flattened</p>
            </AdditionalInfoWrapper>
          }
        />
        <p>
          <img src={isFlat ? SuccessImage : ErrorImage} />
        </p>
      </DetailRow>
    )}
    {selectedHeader && (
      <DetailRow>
        <Popup
          content={'Header selected from source csv'}
          inverted
          mouseEnterDelay={50}
          position={'top left'}
          size='mini'
          trigger={
            <AdditionalInfoWrapper>
              <img src={InfoImage} />
              <p>enrichment selected header</p>
            </AdditionalInfoWrapper>
          }
        />
        <p className={'text-transform-none'}>{selectedHeader}</p>
      </DetailRow>
    )}
    {selectedKey && (
      <DetailRow>
        <Popup
          content={'Key selected from external URL response'}
          inverted
          mouseEnterDelay={50}
          position={'top left'}
          size='mini'
          trigger={
            <AdditionalInfoWrapper>
              <img src={InfoImage} />
              <p>enrichment selected key</p>
            </AdditionalInfoWrapper>
          }
        />
        <p className={'text-transform-none'}>{selectedKey}</p>
      </DetailRow>
    )}
    {showJsonRootPath && (
      <DetailRow>
        <Popup
          content={
            'Specifies the starting path in the JSON structure from which data is extracted. If not set, the default root is used.'
          }
          inverted
          mouseEnterDelay={50}
          position={'top left'}
          size='mini'
          trigger={
            <AdditionalInfoWrapper>
              <img src={InfoImage} />
              <p>json root path</p>
            </AdditionalInfoWrapper>
          }
        />
        <p className={'text-transform-none'}>{jsonRootPath}</p>
      </DetailRow>
    )}
  </DetailElementWrapper>
);
