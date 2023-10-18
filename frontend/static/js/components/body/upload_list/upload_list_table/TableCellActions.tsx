import React from 'react';
import PreviewImage from '../../../../../img/body/list/preview.png';
import DeleteImage from '../../../../../img/body/list/delete-red.png';
import { Popup } from 'semantic-ui-react';
import {
  EnrichButton,
  EnrichPendingButton,
  TableCellActionsWrapper,
} from './TableCellActions.styled';
import { EnrichDetailStatus } from '../../../../api/enums';
import { useNavigate } from 'react-router-dom';

type Props = {
  onOpenDeleteModal: () => void;
  onOpenEnrichStep1Modal: () => void;
  onOpenEnrichStep2Modal: () => void;
  status: EnrichDetailStatus;
  uuid: string;
};

export const TableCellActions: React.FC<Props> = ({
  onOpenDeleteModal,
  onOpenEnrichStep1Modal,
  onOpenEnrichStep2Modal,
  status,
  uuid,
}) => {
  const navigate = useNavigate();

  const handlePreviewClick = (): void => {
    navigate(`/${uuid}/preview`);
  };

  return (
    <TableCellActionsWrapper>
      {status === EnrichDetailStatus.AWAITING_COLUMN_SELECTION && (
        <Popup
          content={'Enrichment is pending. Click and specify columns to merge.'}
          inverted
          mouseEnterDelay={50}
          position={'top center'}
          size='mini'
          trigger={
            <EnrichPendingButton
              data-testid={'open-enrich-step-2-modal-button'}
              onClick={onOpenEnrichStep2Modal}
            >
              <h5>action required</h5>
            </EnrichPendingButton>
          }
        />
      )}
      {status === EnrichDetailStatus.COMPLETED && (
        <>
          <Popup
            content={'Enrich with external URL'}
            inverted
            mouseEnterDelay={50}
            position={'top center'}
            size='mini'
            trigger={
              <EnrichButton
                data-testid={'open-enrich-step-1-modal-button'}
                onClick={onOpenEnrichStep1Modal}
              >
                <h5>enrich</h5>
              </EnrichButton>
            }
          />

          <Popup
            content={'Preview'}
            inverted
            mouseEnterDelay={50}
            position={'top center'}
            size='mini'
            trigger={
              <img
                data-testid={'open-preview'}
                onClick={handlePreviewClick}
                className={'preview'}
                src={PreviewImage}
                alt={'preview'}
              />
            }
          />
        </>
      )}
      <Popup
        content={'Delete'}
        inverted
        mouseEnterDelay={50}
        position={'top center'}
        size='mini'
        trigger={
          <img
            data-testid={'open-delete-modal-button'}
            className={'delete'}
            src={DeleteImage}
            alt={'delete'}
            onClick={onOpenDeleteModal}
          />
        }
      />
    </TableCellActionsWrapper>
  );
};
