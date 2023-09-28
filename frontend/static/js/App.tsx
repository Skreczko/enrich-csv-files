import React, { ReactElement } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { Footer } from './components/footer/Footer';
import { Router } from './router/Router';
import { AppWrapper, MiddleSectionWrapper } from './App.styled';
import { NotificationPopup } from './components/notification/NotificationPopup';

export const App = (): ReactElement => (
  <AppWrapper>
    <Toolbar />
    <MiddleSectionWrapper>
      <NotificationPopup />
      <Router />
      <Footer />
    </MiddleSectionWrapper>
  </AppWrapper>
);
