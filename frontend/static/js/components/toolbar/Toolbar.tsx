import React from 'react';
import { NavLink, ToolbarWrapper } from './Toolbar.styled';
import routes from '../../router/config/routes';
import { useNavigate } from 'react-router-dom';
import { NavLinkType } from './Toolbar.types';
import ListImage from '../../../img/toolbar/list.png';
import DownloadImage from '../../../img/toolbar/download.png';

const navLinks: NavLinkType[] = [
  {
    link: '/',
    imgSrc: ListImage,
    name: 'Uploaded CSV files',
  },
  {
    link: routes.UPLOAD,
    imgSrc: DownloadImage,
    name: 'Upload CSV',
  },
];

export const Toolbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ToolbarWrapper>
      {navLinks.map(({ link, imgSrc, name }) => (
        <NavLink
          key={name.replace(/ /g, '-')}
          onClick={(): void => navigate(link)}
          active={window.location.pathname === link}
        >
          <img src={imgSrc} alt={name} />
          <p>{name}</p>
        </NavLink>
      ))}
    </ToolbarWrapper>
  );
};
