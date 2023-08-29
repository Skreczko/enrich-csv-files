import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  text: string | null;
}

export const HTML: React.FC<Props> = ({ text, ...otherProps }) => {
  if (text == null) {
    return null;
  }
  return <div {...otherProps} dangerouslySetInnerHTML={{ __html: text }} />;
};
