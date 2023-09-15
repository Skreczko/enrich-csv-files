import styled from 'styled-components';
import { mainGreen } from '../../App.styled';

export const FooterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 65px;
  background-color: white;
  border-top: 1px solid lightgray;
`;

interface TextProps {
  textHeight?: string;
}

export const CopyrightText = styled.p<TextProps>`
  display: block;
  font-size: ${({ textHeight }): string => textHeight ?? '13px'};
`;

export const PoweredByText = styled(CopyrightText)`
  margin-top: 10px;
`;

export const HighlightedText = styled.span`
  color: ${mainGreen};
  font-weight: bold;
`;
