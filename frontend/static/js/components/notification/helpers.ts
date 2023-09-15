export type ErrorType = { [key: string]: string[] };

export const truncateString = (str: string, num: number): string => {
  if (str.length <= num) {
    return str;
  }
  const prefix = str.slice(0, num - 4 - 3);
  const suffix = str.slice(-4);
  return prefix + '(...)' + suffix;
};

export const generateHTMLErrorMessages = (error: ErrorType, name?: string): string => `
<!--
    function used to generate string error message with using backend validation (raise forms.ValidationError)
    
    string as response type because it will be pushed to dangerouslySetInnerHTML
       
    "name" variable is optional parameter as there is a need to give more details 
    about request which already failed, ie. file name
--->
  <div style="display: grid; grid-template-columns: max-content 1fr; grid-column-gap: 30px;">
    ${Object.entries(error)
      .map(
        ([errorKey, errorValue]) => `
        <div>
          <p style="font-weight: bold">${name ? `${name} (${errorKey})` : errorKey}</p>
        </div>
        <div>
          <p>${errorValue.join(' ')}</p>
        </div>
      `,
      )
      .join('')}
  </div>
`;
