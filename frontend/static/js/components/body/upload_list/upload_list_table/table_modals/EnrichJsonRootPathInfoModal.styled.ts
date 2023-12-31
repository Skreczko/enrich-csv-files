import styled from 'styled-components';

export const EnrichModalJsonRootPathModalBody = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  justify-content: left;
  align-items: center;

  code {
    font-size: 14px;
  }

  .inputValue {
    margin-top: 20px;
  }

  span {
    font-weight: bold;
    color: red;
  }
`;
