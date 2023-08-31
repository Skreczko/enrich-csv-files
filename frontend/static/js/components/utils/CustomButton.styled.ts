import styled from 'styled-components';

interface CustomButtonProps {
  disabled?: boolean;
  hidden?: boolean;
  margin?: string;
  padding?: string;
  width?: string;
}

export const CustomButton = styled.div<CustomButtonProps>`
  display: flex;
  justify-content: center;
  width: ${({ width }): string => width ?? '200px'};
  padding: ${({ padding }): string => padding ?? '20px 50px'};
  margin: ${({ margin }): string => margin ?? '0'};

  border-radius: 5px;
  text-transform: uppercase;
  cursor: pointer;
  background-color: ${({ disabled }): string => (disabled ? 'lightgrey' : '#4bc5ac')};
  color: white;
`;
export const HiddenUploadInput = styled.input`
  display: none;
`;
