import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/src/generic';

type Props = {
  actionLabel?: string;
  actionLabelColor?: SemanticCOLORS;
  children: React.ReactNode;
  header: string;
  onAction?: () => void;
  onClose: () => void;
  open: boolean;
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'fullscreen';
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
  size,
  subHeader,
}) => (
  <Modal onClose={onClose} open={open} closeOnDimmerClick={false} size={size}>
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
      {onAction && (
        <Button
          color={actionLabelColor}
          onClick={(): void => {
            onAction();
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Modal.Actions>
  </Modal>
);
