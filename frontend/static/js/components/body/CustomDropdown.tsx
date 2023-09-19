/* eslint-disable react/no-array-index-key */
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { CustomDropdownWrapper } from './CustomDropdown.styled';
import {
  DropdownItem,
  DropdownItemEnum,
  DropdownOptions,
  DropdownValueType,
} from './upload_list/table_management/types';

type Props = {
  clearable?: boolean;
  onClick: (value: DropdownValueType) => void;
  options: DropdownOptions[];
  placeholderOnChoice: string;
  placeholderOnSelected: string;
  value: DropdownValueType;
  width?: string;
};

export const CustomDropdown: React.FC<Props> = ({
  clearable,
  onClick,
  options,
  placeholderOnChoice,
  placeholderOnSelected,
  value,
  width,
}) => {
  const [selectedValue, setSelectedValue] = useState<DropdownValueType | null>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleClick = (value: DropdownValueType): void => {
    setSelectedValue(value);
    onClick(value);
  };

  const handleChange = (event: React.SyntheticEvent<HTMLElement>, { value }: any): void => {
    if (value === null) {
      setSelectedValue(null);
      onClick(null);
    } else {
      handleClick(value);
    }
  };

  const getSelectedText = (value: DropdownValueType): string => {
    const foundOption = options?.find(
      option => option.type === DropdownItemEnum.OPTION && option.value === value,
    ) as DropdownItem | undefined;
    return foundOption?.text || '';
  };

  const selectedText = useMemo(() => {
    return getSelectedText(selectedValue);
  }, [selectedValue, options]);

  return (
    <CustomDropdownWrapper width={width}>
      <Dropdown
        clearable={clearable ?? false}
        onChange={handleChange}
        value={selectedValue}
        text={selectedValue ? `${placeholderOnSelected}: ${selectedText}` : placeholderOnChoice}
      >
        <Dropdown.Menu>
          {options.map(
            (option, index): ReactElement => {
              if (option.type === DropdownItemEnum.HEADER) {
                return (
                  <Dropdown.Header key={index}>
                    <p>{option.content}</p>
                  </Dropdown.Header>
                );
              } else if (option.type === DropdownItemEnum.OPTION) {
                return (
                  <Dropdown.Item
                    key={index}
                    className={option.value === selectedValue ? 'selected' : ''}
                    value={option.value}
                    text={option.text}
                    onClick={(): void => handleClick(option.value)}
                  />
                );
              }
              return;
            },
          )}
        </Dropdown.Menu>
      </Dropdown>
    </CustomDropdownWrapper>
  );
};
