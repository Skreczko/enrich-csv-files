import styled from 'styled-components';

export const EnrichProcessSelectionWrapper = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 50px;
  gap: 20px;

  img {
    height: 100px;
    width: 100px;
  }

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    word-break: break-all;
  }
`;

export const EnrichStep2CustomDropdownWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  img {
    height: 20px;
    width: 20px;
    margin-left: 10px;
    cursor: pointer;
  }
`;
