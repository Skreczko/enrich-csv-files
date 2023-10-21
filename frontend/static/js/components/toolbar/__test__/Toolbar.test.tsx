import React from 'react';
import { render, screen } from '../../../utils/testing-utils';
import { Toolbar } from '../Toolbar';

describe('Toolbar', () => {
  test('Rendering', () => {
    render(<Toolbar />);
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });
});
