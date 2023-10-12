import React from 'react';
import { SpinnerDetails, SpinnerWrapper } from './Spinner.styled';

type Props = {
  scale?: number;
};

export const Spinner: React.FC<Props> = ({ scale }) => (
  <SpinnerWrapper scale={scale} data-testid={'spinner'}>
    <SpinnerDetails></SpinnerDetails>
  </SpinnerWrapper>
);
