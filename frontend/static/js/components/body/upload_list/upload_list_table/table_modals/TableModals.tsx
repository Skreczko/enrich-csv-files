import React, { useState } from 'react';
import { CsvFileElement } from '../../../../../api/types';
import { DeleteModal } from './DeleteModal';
import { EnrichModal } from './EnrichModal';
import { EnrichJsonRootPathInfoModal } from './EnrichJsonRootPathInfoModal';

type Props = {
  selectedFileElement: CsvFileElement;
  openDeleteModal: boolean;
  onCloseDeleteModal: () => void;
  onDeleteAction: () => void;
  openEnrichModal: boolean;
  onCloseEnrichModal: () => void;
  onEnrichAction: (enrichUrl: string, jsonRootPath: string) => void;
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
  const [openEnrichJsonRootPathInfoModal, setOpenEnrichJsonRootPathInfoModal] = useState(false);

  return (
    <>
      {openDeleteModal && (
        <DeleteModal
          onAction={onDeleteAction}
          onClose={onCloseDeleteModal}
          open={openDeleteModal}
          selectedFileElement={selectedFileElement}
        />
      )}
      {openEnrichModal && (
        <EnrichModal
          onAction={onEnrichAction}
          onClose={onCloseEnrichModal}
          onOpenEnrichJsonRootPathModal={(): void => setOpenEnrichJsonRootPathInfoModal(true)}
          open={openEnrichModal}
          selectedFileElement={selectedFileElement}
        />
      )}
      {openEnrichJsonRootPathInfoModal && (
        <EnrichJsonRootPathInfoModal
          onClose={(): void => setOpenEnrichJsonRootPathInfoModal(false)}
          open={openEnrichJsonRootPathInfoModal}
        />
      )}
    </>
  );
};
