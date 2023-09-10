import styled from 'styled-components';

export const SpinnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
`;

export const SpinnerDetails = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  -webkit-animation: load5 1.1s infinite ease;
  animation: load5 1.1s infinite ease;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  display: grid;
  place-items: center;

  @-webkit-keyframes load5 {
    0%,
    100% {
      box-shadow: 0em -2.6em 0em 0em #10decc, 1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2),
        2.5em 0em 0 0em rgba(16, 222, 204, 0.2), 1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2),
        0em 2.5em 0 0em rgba(16, 222, 204, 0.2), -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2),
        -2.6em 0em 0 0em rgba(16, 222, 204, 0.5), -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.7);
    }
    12.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.7), 1.8em -1.8em 0 0em #10decc,
        2.5em 0em 0 0em rgba(16, 222, 204, 0.2), 1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2),
        0em 2.5em 0 0em rgba(16, 222, 204, 0.2), -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2),
        -2.6em 0em 0 0em rgba(16, 222, 204, 0.2), -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.5);
    }
    25% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.5),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.7), 2.5em 0em 0 0em #10decc,
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2), 0em 2.5em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2), -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    37.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.5), 2.5em 0em 0 0em rgba(16, 222, 204, 0.7),
        1.75em 1.75em 0 0em #10decc, 0em 2.5em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2), -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    50% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.5),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.7), 0em 2.5em 0 0em #10decc,
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2), -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    62.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.2),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.5), 0em 2.5em 0 0em rgba(16, 222, 204, 0.7),
        -1.8em 1.8em 0 0em #10decc, -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    75% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.2),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2), 0em 2.5em 0 0em rgba(16, 222, 204, 0.5),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.7), -2.6em 0em 0 0em #10decc,
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    87.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.2),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2), 0em 2.5em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.5), -2.6em 0em 0 0em rgba(16, 222, 204, 0.7),
        -1.8em -1.8em 0 0em #10decc;
    }
  }
  @keyframes load5 {
    0%,
    100% {
      box-shadow: 0em -2.6em 0em 0em #10decc, 1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2),
        2.5em 0em 0 0em rgba(16, 222, 204, 0.2), 1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2),
        0em 2.5em 0 0em rgba(16, 222, 204, 0.2), -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2),
        -2.6em 0em 0 0em rgba(16, 222, 204, 0.5), -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.7);
    }
    12.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.7), 1.8em -1.8em 0 0em #10decc,
        2.5em 0em 0 0em rgba(16, 222, 204, 0.2), 1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2),
        0em 2.5em 0 0em rgba(16, 222, 204, 0.2), -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2),
        -2.6em 0em 0 0em rgba(16, 222, 204, 0.2), -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.5);
    }
    25% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.5),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.7), 2.5em 0em 0 0em #10decc,
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2), 0em 2.5em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2), -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    37.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.5), 2.5em 0em 0 0em rgba(16, 222, 204, 0.7),
        1.75em 1.75em 0 0em #10decc, 0em 2.5em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2), -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    50% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.5),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.7), 0em 2.5em 0 0em #10decc,
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.2), -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    62.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.2),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.5), 0em 2.5em 0 0em rgba(16, 222, 204, 0.7),
        -1.8em 1.8em 0 0em #10decc, -2.6em 0em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    75% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.2),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2), 0em 2.5em 0 0em rgba(16, 222, 204, 0.5),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.7), -2.6em 0em 0 0em #10decc,
        -1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2);
    }
    87.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(16, 222, 204, 0.2),
        1.8em -1.8em 0 0em rgba(16, 222, 204, 0.2), 2.5em 0em 0 0em rgba(16, 222, 204, 0.2),
        1.75em 1.75em 0 0em rgba(16, 222, 204, 0.2), 0em 2.5em 0 0em rgba(16, 222, 204, 0.2),
        -1.8em 1.8em 0 0em rgba(16, 222, 204, 0.5), -2.6em 0em 0 0em rgba(16, 222, 204, 0.7),
        -1.8em -1.8em 0 0em #10decc;
    }
  }
`;
