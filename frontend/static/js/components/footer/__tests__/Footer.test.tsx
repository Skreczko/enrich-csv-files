import React from 'react';
import { render, screen } from '../../../utils/testing-utils';
import { Footer } from '../Footer';

describe('Footer', () => {
  test('Rendering', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
