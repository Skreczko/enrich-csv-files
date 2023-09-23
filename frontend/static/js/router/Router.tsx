import React, { ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './config/routes';
import { UploadList } from '../components/body/upload_list/UploadList';
import { UploadFile } from '../components/body/upload_csv/UploadFile';
import { Preview } from '../components/body/preview/Preview';
import { NotFoundComponent } from '../components/body/NotFoundComponent';

export const Router = (): ReactElement => (
  <Routes>
    <Route index element={<UploadList />} />
    <Route path={routes.UPLOAD} element={<UploadFile />} />
    <Route path={routes.PREVIEW} element={<Preview />} />
    <Route path={'*'} element={<NotFoundComponent />} />
  </Routes>
);
