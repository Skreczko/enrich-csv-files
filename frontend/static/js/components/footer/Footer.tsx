import React from 'react';
import { CopyrightText, HighlightedText, PoweredByText, FooterWrapper } from './Footer.styled';

export const Footer: React.FC = () => {
  return (
    <FooterWrapper data-testid={'footer'}>
      <CopyrightText>
        Copyright © {new Date().getFullYear()}{' '}
        <HighlightedText>ADVERITY Transformer Challenge</HighlightedText>. All rights reserved.
      </CopyrightText>
      <PoweredByText textHeight={'9px'}>Powered with ❤️ by Skreczko</PoweredByText>
    </FooterWrapper>
  );
};
