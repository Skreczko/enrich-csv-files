// /* eslint-disable @typescript-eslint/no-var-requires */
//
// import React from "react";
// import { SearchInput } from "./SearchInput";
// import {
//   DropdownTreeMenuItem,
//   SubMenuDropdownButton,
// } from "./SubMenuDropdownButton";
// import { FilterSection } from "./FilterSection";
// import {
//   getPatientListMainTableAction,
//   PatientListFiltersType,
//   setDisplaySettingsMainPatientTable,
// } from "../../api/storeActions";
// import { PatientListMainTableDisplaySettingsType } from "../../api/patientSlice";
// import { useSelector } from "react-redux";
// import { RootState } from "../../api/store";
//
// const sortMenuItems: DropdownTreeMenuItem[] = [
//   {
//     label: "Patient",
//     subItems: [
//       { value: "fn_asc", label: "First name (ASC)" },
//       { value: "fn_desc", label: "First name (DESC)" },
//       {
//         value: "ln_asc",
//         label: "Last name (ASC)",
//       },
//       { value: "ln_desc", label: "Last name (DESC)" },
//       { value: "af", label: "Activated (ASC)" },
//       { value: "al", label: "Activated (DESC)" },
//       { value: "aa", label: "Account archived" },
//     ],
//   },
//   {
//     label: "Doctor",
//     subItems: [
//       { value: "d_fn_asc", label: "First name (ASC)" },
//       { value: "d_fn_desc", label: "First name (DESC)" },
//       {
//         value: "d_ln_asc",
//         label: "Last name (ASC)",
//       },
//       { value: "d_ln_desc", label: "Last name (DESC)" },
//     ],
//   },
//   {
//     label: "DOB",
//     subItems: [
//       { label: "(ASC) ", value: "dob_asc" },
//       { label: "(DESC) ", value: "dob_desc" },
//     ],
//   },
//   {
//     label: "Status",
//     subItems: [
//       { value: "fc", label: "Forms filled" },
//       { value: "fs", label: "Forms sent" },
//       { value: "fip", label: "Forms filling in progress" },
//     ],
//   },
// ];
//
// export const SortingSection: React.FC = () => {
//   const { sortBy }: PatientListMainTableDisplaySettingsType = useSelector(
//     (state: RootState) => state.patient.patientListMainTableDisplaySettings
//   );
//
//   const setSortBy = (value: DropdownTreeMenuItem | null): void => {
//     setDisplaySettingsMainPatientTable({ sortBy: value, pageNumber: 1 });
//     getPatientListMainTableAction({
//       force: true,
//     });
//   };
//
//   return (
//     <SubMenuDropdownButton
//       selectedOption={sortBy}
//       setSelectedOption={setSortBy}
//       menuOptions={sortMenuItems}
//       placeholder={"Add sorting"}
//       label={"Sort by:"}
//     />
//   );
// };
