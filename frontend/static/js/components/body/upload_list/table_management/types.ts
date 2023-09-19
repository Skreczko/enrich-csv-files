export type DropdownValueType = string | number | boolean;

export enum DropdownItemEnum {
  HEADER,
  OPTION,
}

export type DropdownItem = {
  value: DropdownValueType;
  text: string;
  type: DropdownItemEnum.OPTION;
};
type DropdownGroupHeader = {
  content: string;
  type: DropdownItemEnum.HEADER;
};
export type DropdownOptions = DropdownItem | DropdownGroupHeader;
