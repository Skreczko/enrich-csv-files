import React from 'react';
import { ToolbarWrapper } from './Toolbar.styled';
import { Link } from 'react-router-dom';
import routes from '../../router/config/routes';

export const Toolbar: React.FC = () => (
  <ToolbarWrapper>
    <Link to={'/'}>
      <div>
        <h3>Tables list</h3>
      </div>
    </Link>
    <Link to={routes.UPLOAD}>
      <div>
        <h3>Upload CSV</h3>
      </div>
    </Link>
  </ToolbarWrapper>
);
