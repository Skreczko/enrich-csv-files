import React, { ReactElement } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { Footer } from './components/footer/Footer';
import { Router } from './router/Router';
import { AppWrapper, BodyWrapper, MiddleSectionWrapper } from './App.styled';

export const App = (): ReactElement => (
  <AppWrapper>
    <Toolbar />
    <MiddleSectionWrapper>
      <BodyWrapper>
        <Router />
      </BodyWrapper>
      <Footer />
    </MiddleSectionWrapper>
  </AppWrapper>
);
