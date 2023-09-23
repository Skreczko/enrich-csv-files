import React from 'react';
import { CustomGenericModal } from '../../../CustomGenericModal';
import {
  jsonFlattenFirstExample,
  jsonFlattenSecondExample,
  jsonFlattenThirdExample,
} from './jsonExamples';
import { EnrichModalJsonFlatten2Columns } from './EnrichJsonFlattenStructureInfoModal.styled';
import Example1Image from '../../../../../../img/body/list/flatten_dict_examples/example_1.png';
import Example2FlattenedImage from '../../../../../../img/body/list/flatten_dict_examples/example_2_flattened.png';
import Example2NonFlattenedImage from '../../../../../../img/body/list/flatten_dict_examples/example_2_non_flattened.png';
import Example3FlattenedImage from '../../../../../../img/body/list/flatten_dict_examples/example_3_flattened.png';
import Example3NonFlattenedImage from '../../../../../../img/body/list/flatten_dict_examples/example_3_non_flattened.png';

type Props = {
  onClose: () => void;
  open: boolean;
};

export const EnrichJsonFlattenStructureInfoModal: React.FC<Props> = ({ onClose, open }) => {
  return (
    <CustomGenericModal
      open={open}
      onClose={onClose}
      header={'JSON flatten structure'}
      subHeader={'Examples'}
      size={'fullscreen'}
    >
      <p>
        Flattening a JSON structure involves transforming nested keys into a flat, tabular form.
        This is particularly useful when converting JSON data into a CSV format, where nested
        structures are not easily represented. In the flattened version, each nested key is combined
        with its parent key, separated by an underscore (_). This process creates new, unique
        columns in the CSV representation, making the data easier to analyze and manipulate.
      </p>
      <EnrichModalJsonFlatten2Columns>
        <div>
          <pre>
            <code>{jsonFlattenFirstExample}</code>
          </pre>
        </div>
        <div>
          <img src={Example1Image} alt={'example-1'} />
          <p>
            In this example, the JSON structure is already flat, meaning there are no nested
            objects. Whether you choose to <b>Flatten JSON Structure</b> or not, the CSV
            representation will remain the same, with a straightforward one-to-one mapping between
            the JSON keys and the CSV columns. Essentially, flattening has no effect on already flat
            structures.
          </p>
        </div>
        <div>
          <pre>
            <code>{jsonFlattenSecondExample}</code>
          </pre>
        </div>
        <div>
          <img src={Example2NonFlattenedImage} alt={'example-2-non-flatten'} />
          <img src={Example2FlattenedImage} alt={'example-2-flatten'} />
          <p>
            In this example, the JSON structure contains a single level of nesting under the{' '}
            <b>address</b> key. When you choose to <b>Flatten JSON Structure</b>, this nesting is
            removed, and new columns are created for each nested key. These new columns are named by
            combining the parent key and the nested key, separated by an underscore. For example,
            <b>address_city</b> and <b>address_zip</b> are new columns created in the CSV
            representation.
          </p>
        </div>

        <div>
          <pre>
            <code>{jsonFlattenThirdExample}</code>
          </pre>
        </div>
        <div>
          <img src={Example3NonFlattenedImage} alt={'example-3-non-flatten'} />
          <img src={Example3FlattenedImage} alt={'example-3-flatten'} />
          <p>
            In this example, the JSON structure contains two levels of nesting under the{' '}
            <b>address</b> and <b>coordinates</b> keys. When you opt for{' '}
            <b>Flatten JSON Structure</b>, both levels of nesting are removed. New columns are
            created for each nested key, and these columns are named by combining all parent keys
            and the nested key, separated by underscores. For instance,{' '}
            <b>address_coordinates_lat</b> and <b>address_coordinates_lon</b> are new columns
            created in the CSV representation.
          </p>
        </div>
      </EnrichModalJsonFlatten2Columns>
    </CustomGenericModal>
  );
};
