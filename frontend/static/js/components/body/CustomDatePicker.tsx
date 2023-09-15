import React from 'react';
import DatePicker from 'react-datepicker';
import CalendarImage from '../../../img/body/list/calendar.png';

import { CustomDatePickerWrapper } from './CustomDatePicker.styled';

type Props = {
  minDate?: string;
  onChange: (isoDateString: string) => void;
  placeholderOnChoice: string;
  placeholderOnSelected: string;
  selectedDate: string;
  width?: string;
};

export const CustomDatePicker: React.FC<Props> = ({
  minDate,
  onChange,
  placeholderOnChoice,
  placeholderOnSelected,
  selectedDate,
  width,
}) => (
  <CustomDatePickerWrapper width={width}>
    <DatePicker
      selected={selectedDate ? new Date(selectedDate) : null}
      minDate={minDate ? new Date(minDate) : null}
      maxDate={new Date()}
      isClearable
      placeholderText={
        selectedDate
          ? `${placeholderOnSelected}: ${selectedDate.split('T')[0]}`
          : placeholderOnChoice
      }
      dateFormat='dd/MM/yyyy'
      onChange={(date: Date | null): void => {
        onChange(date ? date.toISOString() : null);
      }}
    />
    <img src={CalendarImage} alt='calendar' />
  </CustomDatePickerWrapper>
);
