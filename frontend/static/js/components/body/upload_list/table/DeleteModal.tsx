import React from 'react';
import { Button, Modal } from 'semantic-ui-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onAction: () => void;
  content: string;
  header: string;
};

export const DeleteModal: React.FC<Props> = ({ open, onClose, onAction, content, header }) => (
  <Modal onClose={onClose} open={open} trigger={<Button>Show Modal</Button>}>
    <Modal.Header>{header}</Modal.Header>
    <Modal.Content>
      <Modal.Description>
        <p>{content}</p>
      </Modal.Description>
    </Modal.Content>
    <Modal.Actions>
      <Button color='grey' onClick={(): void => onClose()}>
        Close
      </Button>
      <Button
        color='red'
        onClick={(): void => {
          onAction();
          onClose();
        }}
      >
        Delete
      </Button>
    </Modal.Actions>
  </Modal>
);
