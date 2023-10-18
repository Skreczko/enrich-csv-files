import React from 'react';
import { render, screen } from '../../../utils/testing-utils';
import NotFoundComponent from '../NotFoundComponent';

describe('NotFoundComponent', () => {
  test('Rendering', () => {
    render(<NotFoundComponent />);
    expect(screen.getByTestId('not-found-component')).toBeInTheDocument();
  });
});
