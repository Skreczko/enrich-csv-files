import React, { ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './config/routes';
import { Test1 } from '../components/body/Test1';
import { Test2 } from '../components/body/Test2';

export const Router = (): ReactElement => (
  <Routes>
    <Route index element={<Test1 />} />
    <Route path={routes.UPLOAD} element={<Test2 />} />
  </Routes>
);
