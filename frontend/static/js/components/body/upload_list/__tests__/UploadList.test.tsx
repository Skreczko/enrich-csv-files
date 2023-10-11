import React from 'react';
import { render, screen } from '../../../../utils/testing-utils';
import UploadList from '../UploadList';

describe('UploadList', () => {
  test('Rendering', () => {
    render(<UploadList />);
    expect(screen.getByTestId('upload-list')).toBeInTheDocument();
  });
});
