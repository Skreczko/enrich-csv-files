import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/src/generic';

type Props = {
  actionLabel: string;
  actionLabelColor: SemanticCOLORS;
  children: React.ReactNode;
  header: string;
  onAction: () => void;
  onClose: () => void;
  open: boolean;
  subHeader?: string;
};

export const CustomGenericModal: React.FC<Props> = ({
  actionLabel,
  actionLabelColor,
  children,
  header,
  onAction,
  onClose,
  open,
  subHeader,
}) => (
  <Modal onClose={onClose} open={open}>
    <Modal.Header>{header}</Modal.Header>
    <Modal.Content>
      {!!subHeader && (
        <Modal.Description>
          <h4>{subHeader}</h4>
          <br />
        </Modal.Description>
      )}
      <Modal.Description>{children}</Modal.Description>
    </Modal.Content>
    <Modal.Actions>
      <Button color='grey' onClick={onClose}>
        Close
      </Button>
      <Button
        color={actionLabelColor}
        onClick={(): void => {
          onAction();
          onClose();
        }}
      >
        {actionLabel}
      </Button>
    </Modal.Actions>
  </Modal>
);
