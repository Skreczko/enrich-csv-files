import React, { ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './config/routes';
import { UploadList } from '../components/body/upload_list/UploadList';
import { UploadFile } from '../components/body/upload/UploadFile';

export const Router = (): ReactElement => (
  <Routes>
    <Route index element={<UploadList />} />
    <Route path={routes.UPLOAD} element={<UploadFile />} />
  </Routes>
);
