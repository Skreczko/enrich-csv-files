import React from 'react';
import { NotFoundWrapper } from './NotFoundComponent.styled';
import NotFoundImage2 from '../../../img/body/preview/error-404-2.png';

const NotFoundComponent: React.FC = () => (
  <NotFoundWrapper data-testid={'not-found-component'}>
    <img src={NotFoundImage2} alt={'not-found'} />
    <h1>NOT FOUND</h1>
  </NotFoundWrapper>
);

export default NotFoundComponent;
