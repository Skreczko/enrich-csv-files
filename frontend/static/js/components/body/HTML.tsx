import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  text: string | null;
}

export const HTML: React.FC<Props> = ({ text, ...otherProps }) => (
  <div data-testid={'html-component'} {...otherProps} dangerouslySetInnerHTML={{ __html: text }} />
);
