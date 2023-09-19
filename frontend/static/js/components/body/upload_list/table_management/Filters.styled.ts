import styled from 'styled-components';

export const FiltersWrappers = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  > *:not(:first-child):not(:nth-child(2)) {
    margin-left: 10px;
  }

  img {
    height: 20px;
    width: 20px;
    margin-right: 10px;
  }
`;
