import React from 'react';
import PreviewImage from '../../../../../img/body/list/preview.png';
import DeleteImage from '../../../../../img/body/list/delete-red.png';
import { Popup } from 'semantic-ui-react';
import { EnrichButton, TableCellActionsWrapper } from './TableCellActions.styled';

type Props = {
  onOpenDeleteModal: () => void;
  onOpenEnrichModal: () => void;
  completed: boolean;
};

export const TableCellActions: React.FC<Props> = ({
  completed,
  onOpenDeleteModal,
  onOpenEnrichModal,
}) => (
  <TableCellActionsWrapper>
    {completed && (
      <>
        <Popup
          content={'Enrich with external URL'}
          inverted
          mouseEnterDelay={50}
          position={'top center'}
          size='mini'
          trigger={
            <EnrichButton onClick={onOpenEnrichModal}>
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
          trigger={<img className={'preview'} src={PreviewImage} alt={'preview'} />}
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
        <img className={'delete'} src={DeleteImage} alt={'delete'} onClick={onOpenDeleteModal} />
      }
    />
  </TableCellActionsWrapper>
);
