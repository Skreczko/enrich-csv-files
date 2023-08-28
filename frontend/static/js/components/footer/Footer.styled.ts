import styled from 'styled-components';

export const FooterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  //width: 100%;
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
  color: #4bc5ac;
  font-weight: bold;
`;
