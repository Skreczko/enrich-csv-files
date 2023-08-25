import React from 'react';
import { CopyrightText, HighlightedText, PoweredByText, FooterWrapper } from './Footer.styled';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <FooterWrapper>
      <CopyrightText>
        Copyright © {currentYear} <HighlightedText>ADVERITY Transformer Challenge</HighlightedText>.
        All rights reserved.
      </CopyrightText>
      <PoweredByText textHeight={'9px'}>Powered with ❤️ by Skreczko</PoweredByText>
    </FooterWrapper>
  );
};
