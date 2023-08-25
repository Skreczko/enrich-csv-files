import React, { ReactElement } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { Footer } from './components/footer/Footer';
import { Router } from './router/Router';
import { AppWrapper, BodyWrapper } from './App.styled';

export const App = (): ReactElement => (
  <AppWrapper>
    <Toolbar />
    <BodyWrapper>
      <Router />
      <Footer />
    </BodyWrapper>
  </AppWrapper>
);
