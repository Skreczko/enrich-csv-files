import styled from 'styled-components';
import { lightGrey } from '../../../../App.styled';

export const DetailWrapper = styled.div`
  border-top: 2px solid ${lightGrey};
  > div {
    padding: 20px 40px;

    &:last-child {
      border-right: none;
    }
  }
`;

export const DetailElementWrapper = styled.div`
  padding: 20px 40px;

  h5 {
    margin-bottom: 20px;
  }

  .in-progress {
    font-weight: normal;
    font-size: 12px;
  }
`;

export const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 10px;
  font-size: 12px;
  margin: 2px 0;

  p {
    word-wrap: break-word;
    &.text-transform-none {
      text-transform: none;
    }
  }

  img {
    height: 12px;
    width: 12px;
  }
`;

export const AdditionalInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;
