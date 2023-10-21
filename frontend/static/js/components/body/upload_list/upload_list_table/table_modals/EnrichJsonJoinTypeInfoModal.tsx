import React from 'react';
import { CustomGenericModal } from '../../../CustomGenericModal';
import CustomerTable from '../../../../../../img/body/list/join_type_examples/table_customers.png';
import OrderTable from '../../../../../../img/body/list/join_type_examples/table_orders.png';
import LeftJoinTable from '../../../../../../img/body/list/join_type_examples/table_left_join.png';
import RightJoinTable from '../../../../../../img/body/list/join_type_examples/table_right_join.png';
import InnerJoinTable from '../../../../../../img/body/list/join_type_examples/table_inner_join.png';
import {
  EnrichJsonJoinTypeExampleTablesWrapper,
  EnrichJsonJoinTypeTableWrapper,
} from './EnrichJsonJoinTypeInfoModal.styled';

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
      size={'large'}
      testId={'enrich-json-join-type-info-modal'}
    >
      <p>
        In this project, you have three options for joining data from a CSV file and a URL JSON
        response. Below, you will find a brief description of each method, illustrated with examples
        using two sample tables.
      </p>
      <EnrichJsonJoinTypeExampleTablesWrapper>
        <div>
          <h3>CSV File</h3>
          <img src={CustomerTable} alt={'customer-table'} />
          <p>
            The <b>Customers</b> table is sourced from a CSV file and contains basic information
            about individual customers. Each customer is identified by a unique ID, along with their
            First Name and Last Name.
          </p>
          <p className={'inputValue'}>
            Selected header: <b>ID</b>
          </p>
        </div>
        <div>
          <h3>URL JSON response</h3>
          <img src={OrderTable} alt={'order-table'} />
          <p>
            The <b>Orders</b> table is populated from a URL JSON response and tracks customer
            orders. Each order has a unique Order ID, a Customer ID that links to the{' '}
            <b>Customers</b> table, the Product ordered, and the Quantity of the product.
          </p>
          <p className={'inputValue'}>
            Selected JSON Key: <b>CUSTOMER ID</b>
          </p>
        </div>
      </EnrichJsonJoinTypeExampleTablesWrapper>
      <EnrichJsonJoinTypeTableWrapper>
        <div>
          <img src={LeftJoinTable} alt={'left-join-table'} />
        </div>
        <div>
          <p>
            The Left Join table includes all rows from the <b>Customers</b> table (sourced from a
            CSV file) and the matching rows from the <b>Orders</b> table (populated from a URL JSON
            response). If a customer has not made any orders, the fields from the <b>Orders</b>{' '}
            table will be left empty.
          </p>
        </div>
      </EnrichJsonJoinTypeTableWrapper>
      <EnrichJsonJoinTypeTableWrapper>
        <div>
          <img src={RightJoinTable} alt={'right-join-table'} />
        </div>
        <div>
          <p>
            The Right Join table includes all rows from the <b>Orders</b> table (populated from a
            URL JSON response) and the matching rows from the <b>Customers</b> table (sourced from a
            CSV file). If there is no match, the fields from the <b>Customers</b> table will be left
            empty.
          </p>
        </div>
      </EnrichJsonJoinTypeTableWrapper>
      <EnrichJsonJoinTypeTableWrapper>
        <div>
          <img src={InnerJoinTable} alt={'inner-join-table'} />
        </div>
        <div>
          <p>
            The Inner Join table merges rows from both the <b>Customers</b> (sourced from a CSV
            file) and <b>Orders</b> (populated from a URL JSON response) tables based on matching ID
            and Customer ID. This table will only include customers who have made an order and
            orders that have a corresponding customer.
          </p>
        </div>
      </EnrichJsonJoinTypeTableWrapper>
    </CustomGenericModal>
  );
};
