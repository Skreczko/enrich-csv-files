import React from 'react';
import {
  AdditionalInfoWrapper,
  DetailElementWrapper,
  DetailRow,
} from './TableRowDetailSection.styled';
import { FileDetail } from '../../../../api/types';
import moment from 'moment';
import InfoImage from '../../../../../img/notification/info.png';
import { Popup } from 'semantic-ui-react';

type Props = {
  uuid: string;
  created: string;
  file: FileDetail;
  responseElements: number;
  responseKeys: string[];
};

export const TableRowDetailEnrichDetail: React.FC<Props> = ({
  uuid,
  responseKeys,
  responseElements,
  file,
  created,
}) => (
  <DetailElementWrapper>
    <h5>External url details</h5>
    <DetailRow>
      <p>id</p>
      <p className={'text-transform-none'}>{uuid}</p>
    </DetailRow>
    <DetailRow>
      <p>created</p>
      <p className={'text-transform-none'}>{moment(created).format('HH:mm YYYY-MM-DD')}</p>
    </DetailRow>
    <DetailRow>
      <p>size</p>
      <p className={'text-transform-none'}>{(file?.size / 1024 ** 2).toFixed(2)} MB</p>
    </DetailRow>
    <DetailRow>
      <p>response elements</p>
      <p>{responseElements}</p>
    </DetailRow>
    <DetailRow>
      <p>response keys</p>
      <p className={'text-transform-none'}>{responseKeys?.join(', ')}</p>
    </DetailRow>
    <DetailRow>
      <Popup
        content={
          'The URL response was saved to a file at the start of the enrichment process to preserve the original version of the response upon which the enrichment was based. As the response might change over time, this is retained for historical reference.'
        }
        inverted
        mouseEnterDelay={50}
        position={'top left'}
        size='mini'
        trigger={
          <AdditionalInfoWrapper>
            <img src={InfoImage} />
            <p>saved url response</p>
          </AdditionalInfoWrapper>
        }
      />
      <a href={file?.url} target={'_blank'} rel={'noopener noreferrer'}>
        link
      </a>
    </DetailRow>
  </DetailElementWrapper>
);
