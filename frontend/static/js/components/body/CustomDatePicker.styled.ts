import styled from 'styled-components';
import { mainGreen, tableMainColor } from '../../App.styled';

export const CustomDatePickerWrapper = styled.div<{ width?: string }>`
  font-size: 12px;
  position: relative;

  img {
    height: 15px;
    width: 15px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }

  .react-datepicker {
    &-popper {
      z-index: 3;
    }

    &__day--selected {
      background-color: ${mainGreen};
    }

    &__day--keyboard-selected {
      background-color: ${tableMainColor};
    }

    &__aria-live {
      display: none;
    }

    &__input-container {
      width: ${({ width }): string => width ?? '150px'};

      input {
        width: ${({ width }): string => width ?? '150px'};
        height: 26px;
        padding: 0 10px;
        border: 1px solid lightgray;
        cursor: pointer;

        &::placeholder {
          color: black;
        }
      }
    }

    &__close-icon {
      position: absolute;
      top: 50%;
      right: 35px;
      transform: translateY(-50%);

      &::after {
        background-color: transparent;
        color: black;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }
`;
