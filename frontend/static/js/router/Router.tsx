import React, { lazy, ReactElement, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './config/routes';
import { BodyWrapper } from '../App.styled';
import { Spinner } from '../components/body/Spinner';

const UploadList = lazy(() => import('../components/body/upload_list/UploadList'));
const UploadFile = lazy(() => import('../components/body/upload_csv/UploadFile'));
const Preview = lazy(() => import('../components/body/preview/Preview'));
const NotFoundComponent = lazy(() => import('../components/body/NotFoundComponent'));

const renderWrappedComponent = (
  Component: React.ComponentType,
  props?: { [key: string]: any },
): ReactElement => (
  // The wrapper is used to provide a scrollbar to the component.
  // The Preview component is not wrapped because it requires direct access to the scroll properties
  // (like scrollHeight) to fetch chunk data at the correct scroll position.
  <BodyWrapper>
    <Component {...props} />
  </BodyWrapper>
);

export const Router = (): ReactElement => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route index element={renderWrappedComponent(UploadList)} />
      <Route path={routes.UPLOAD} element={renderWrappedComponent(UploadFile)} />
      <Route path={routes.PREVIEW} element={<Preview />} />
      <Route path={'*'} element={<NotFoundComponent />} />
    </Routes>
  </Suspense>
);
