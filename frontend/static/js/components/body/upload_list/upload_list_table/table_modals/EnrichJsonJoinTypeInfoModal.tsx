import React from 'react';
import { CustomGenericModal } from '../../../CustomGenericModal';
import { jsonFirstExample, jsonSecondExample, jsonThirdExample } from './jsonExamples';
import { EnrichModalJsonRootPathModalBody } from './EnrichJsonRootPathInfoModal.styled';

type Props = {
  onClose: () => void;
  open: boolean;
};

export const EnrichJsonJoinTypeInfoModal: React.FC<Props> = ({ onClose, open }) => {
  return (
    <CustomGenericModal
      open={open}
      onClose={onClose}
      header={'JSON join types'}
      subHeader={'Examples'}
    >
      <p>
        Please open the URL you provided in a browser and inspect its structure. Below are some
        examples to guide you in correctly filling out the URL JSON root path input. Keys should be
        separated with dot (.), without any other characters (i.e. &quot;&quot;, &apos;&apos;, _, {}
        )
      </p>
      <EnrichModalJsonRootPathModalBody>
        <div>
          <pre>
            <code>{jsonFirstExample}</code>
          </pre>
        </div>
        <div>
          <p>
            In this example, the response is in the form of a list, where objects are directly
            within that list. In this case, you should leave the input field empty.
          </p>
          <p className={'inputValue'}>
            <b>Input value must be empty</b>
          </p>
        </div>
        <div>
          <pre>
            <code>{jsonSecondExample}</code>
          </pre>
        </div>
        <div>
          <p>
            In this example, the response is in the form of a dictionary where the key is{' '}
            <span>results</span> and its value is a list of objects. You should provide the key (
            <span>results</span>) in the input as the root of the objects to be used in the
            enrichment process.
          </p>
          <br />
          <p>
            Only records from <span>results</span> will be included in the enrichment process. Other
            records, such as those under the <span>next</span> key, should be enriched individually.
          </p>
          <p className={'inputValue'}>
            Input value: <b>results</b>
          </p>
        </div>
        <div>
          <pre>
            <code>{jsonThirdExample}</code>
          </pre>
        </div>
        <div>
          <p>
            In this example, the response is in the form of a dictionary with keys{' '}
            <span>results</span> and <span>data</span>. The list of objects is the value of{' '}
            <span>data</span> and should be used in the enrichment process. The input you provide
            should be <span>results.data</span>.
          </p>
          <p className={'inputValue'}>
            Input value: <b>results.data</b>
          </p>
        </div>
      </EnrichModalJsonRootPathModalBody>
    </CustomGenericModal>
  );
};
