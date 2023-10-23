import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '../../../../utils/testing-utils';
import { createMockFileType, mockFileTypes, selectedCsvFileUuid } from '../../../../utils/mockData';
import { FileStatusEnum } from '../types';
import { NotificationAppearanceEnum } from '../../../notification/NotificationPopup';
import UploadFile from '../UploadFile';
import * as apiActions from '../../../../api/actions';
import { NotificationPopupData } from '../../../../redux/NotificationPopupSlice';

// mock uploadFile function
jest.mock('../../../../api/actions', () => {
  const actualImports = jest.requireActual('../../../../api/actions');

  return {
    ...actualImports,
    uploadFile: jest.fn(),
  };
});

describe('UploadFile', () => {
  let store: any;

  beforeEach(() => {
    jest.resetAllMocks();
    // render component
    const rendered = render(<UploadFile />);
    store = rendered.store;
    // check if upload file element redux state is empty
    expect(store.getState().uploadSection).toHaveLength(0);
  });

  test('Default render', () => {
    expect(screen.getByTestId('upload-file')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-controls')).toBeInTheDocument();
    expect(screen.getByTestId('upload-file-drag-and-drop')).toBeInTheDocument();
    expect(screen.getByTestId('upload-file-button')).toBeInTheDocument();
  });

  describe('with using UploadFileButton:', () => {
    let input: HTMLElement;

    beforeEach(() => {
      input = screen.getByTestId('upload-file-hidden-upload-input');
    });

    const checkNotification = (
      appearance: NotificationAppearanceEnum,
      additionalContent?: string,
    ): void => {
      const notifications = store.getState().notificationPopup;
      expect(notifications).toHaveLength(1);
      const notification = notifications[0];
      expect(notification.appearance).toEqual(appearance);
      if (appearance === NotificationAppearanceEnum.ERROR) {
        expect(notification.content).toEqual('An error occurred during the upload process');
      }
      if (additionalContent) {
        expect(notification.additionalContent).toContain(additionalContent);
      }
    };

    test('Add correct files', () => {
      // add correct files (csv)
      fireEvent.change(input, {
        target: { files: mockFileTypes.map(fileType => fileType.file) },
      });
      expect(store.getState().uploadSection).toHaveLength(3);
      // there should be no notification, as files are correct (csv)
      expect(store.getState().notificationPopup).toHaveLength(0);
    });

    test('Add duplicated file', () => {
      // add correct files (csv)
      fireEvent.change(input, {
        target: { files: mockFileTypes.map(fileType => fileType.file) },
      });

      // add duplicated file
      fireEvent.change(input, {
        target: { files: [mockFileTypes[0].file] },
      });
      // notification should emerge
      checkNotification(NotificationAppearanceEnum.ERROR, 'File already added');
    });

    test('Add incorrect files', () => {
      // add incorrect files (other than csv)
      fireEvent.change(input, {
        target: {
          files: [
            createMockFileType('file1.pdf', 'application/pdf').file,
            FileStatusEnum.UPLOAD_ERROR,
          ],
        },
      });
      // there should be notification, as file is incorrect (pdf)
      checkNotification(NotificationAppearanceEnum.ERROR, 'Incorrect file type (application/pdf)');
    });
  });

  describe('UploadedFileList', () => {
    beforeEach(async () => {
      const input = screen.getByTestId('upload-file-hidden-upload-input');
      fireEvent.change(input, {
        target: { files: mockFileTypes.map(fileType => fileType.file) },
      });
      await waitFor(() => {
        expect(store.getState().uploadSection).toHaveLength(3);
      });
    });
    test('Default render', () => {
      // check if files emerge in UploadedFileList
      expect(screen.getByTestId('uploaded-file-list')).toBeInTheDocument();

      waitFor(() => {
        expect(screen.queryAllByTestId('uploaded-file-progress-bar')).toHaveLength(3);
        expect(screen.queryAllByTestId('uploaded-file-remove-file-icon')).toHaveLength(3);
        expect(screen.getByTestId('upload-file-button')).toBeInTheDocument();
      });
    });

    test.each([
      ['success upload request', true],
      ['failed upload reqeust', false],
    ])('Click on upload button with %s', async (_, successRequest: boolean) => {
      // mock response for uploadFile function
      jest.mock('../../../../api/actions', () => {
        const actualImports = jest.requireActual('../../../../api/actions');
        return {
          ...actualImports,
          uploadFile: jest.fn(),
        };
      });
      if (successRequest) {
        (apiActions.uploadFile as jest.Mock).mockImplementation(() =>
          Promise.resolve({
            original_file_name: 'users_posts_audience.csv',
            uuid: selectedCsvFileUuid,
          }),
        );
      } else {
        (apiActions.uploadFile as jest.Mock).mockImplementation(() =>
          Promise.reject({
            response: {
              data: {
                error: 'An error occurred while uploading the file',
              },
            },
          }),
        );
      }

      act(() => {
        fireEvent.click(screen.getByTestId('upload-file-button-onclick'));
      });

      // 3 notifications should emerge
      await waitFor(() => {
        expect(store.getState().notificationPopup).toHaveLength(3);
      });

      // check notifications content
      const notifications: NotificationPopupData[] = store.getState().notificationPopup;
      if (successRequest) {
        notifications.forEach(notification => {
          expect(notification.appearance).toEqual(NotificationAppearanceEnum.SUCCESS);
          expect(notification.content).toEqual(
            'users_posts_audience.csv file has been uploaded successfully',
          );
        });
      } else {
        notifications.forEach(notification => {
          expect(notification.appearance).toEqual(NotificationAppearanceEnum.ERROR);
          expect(notification.content).toEqual('An error occurred during the upload process');
        });
      }
      // upload button should be disabled until you provide new files using drag and drop of "add file" button to prevent reupload to backend
      expect(screen.getByTestId('upload-file-button-onclick')).toHaveAttribute('disabled', '');
    });

    test('Click on remove uploaded file icon', async () => {
      act(() => {
        fireEvent.click(screen.queryAllByTestId('uploaded-file-remove-file-icon')[0]);
      });

      await waitFor(() => {
        // check if 2 uploaded files are displayed
        expect(screen.queryAllByTestId('uploaded-file-progress-bar')).toHaveLength(2);
        expect(screen.queryAllByTestId('uploaded-file-remove-file-icon')).toHaveLength(2);
      });
    });
  });

  describe('UploadFileDragAndDrop functionality', () => {
    let correctDropZone: HTMLElement;

    beforeEach(() => {
      correctDropZone = screen.getByTestId('upload-file-drag-and-drop');
    });

    test.each([
      ['correct', true],
      ['incorrect', false],
    ])(
      'Drag and drop file with correct format on %s drop zone',
      (_, isCorrectDropZone: boolean) => {
        const file = new File(['content'], 'test.csv', { type: 'text/csv' });

        // Ensure that the DragWrapper with data-testid="drop-zone-invisible" can be found at the beginning of the test.
        expect(screen.getByTestId('drop-zone-invisible')).toBeInTheDocument();

        // Start the drag action over the component
        act(() => {
          fireEvent.dragOver(
            isCorrectDropZone ? correctDropZone : screen.getByTestId('file-upload-controls'),
          );
        });

        // 2.After the simulated drag, check if the DropWrapper with the correct data-testid became visible if isCorrectDropZone is true.
        expect(
          screen.getByTestId(isCorrectDropZone ? 'drop-zone-visible' : 'drop-zone-invisible'),
        ).toBeInTheDocument();

        // End the drag action over the component
        fireEvent.drop(correctDropZone, {
          dataTransfer: { files: [file] },
        });

        // After the drag action ends, check if the DragWrapper with data-testid="drop-zone-invisible" became visible again.
        expect(screen.getByTestId('drop-zone-invisible')).toBeInTheDocument();

        // there is no notification for correct file format
        expect(store.getState().notificationPopup).toHaveLength(0);
      },
    );

    test('Drag and drop file with incorrect format', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.dragOver(correctDropZone);
      fireEvent.drop(correctDropZone, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(store.getState().notificationPopup).toHaveLength(1);
      });
      const notification = store.getState().notificationPopup[0];
      expect(notification.appearance).toEqual(NotificationAppearanceEnum.ERROR);
      expect(notification.content).toEqual('An error occurred during the upload process');
    });
  });
});
