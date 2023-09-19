// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable @typescript-eslint/no-var-requires */
//
// import React, { useState } from "react";
// import styled from "styled-components";
// import CustomDropdown from "../Dropdown";
// import { userList } from "../../api/action";
// import { UserRole } from "../toolbar/user/User";
// import { RootState, store } from "../../api/store";
// import { SubMenuDropdownButton } from "./SubMenuDropdownButton";
// import { DateRangePicker } from "./DateRangePicker";
// import {
//   getPatientListMainTableAction,
//   PatientListFiltersType,
//   setDisplaySettingsMainPatientTable,
// } from "../../api/storeActions";
// import { PatientListMainTableDisplaySettingsType } from "../../api/patientSlice";
// import { useSelector } from "react-redux";
//
// const Wrapper = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   margin: 20px 0 50px;
//   align-items: center;
//   box-sizing: border-box;
// `;
//
// const FilterButtonWrapper = styled.div`
//   display: flex;
//   gap: 20px;
//   position: relative;
// `;
//
// const PlusImg = styled.img`
//   margin-right: 5px !important;
//   height: 10px !important;
//   width: 10px !important;
// `;
//
// interface StyledPProps {
//   color?: string;
// }
//
// const StyledP = styled.p<StyledPProps>`
//   font-size: 12px;
//   margin-right: 20px;
//   color: ${({ color }): string => color || "#3c5153"} !important;
// `;
//
// const CustomDropdownWrapper = styled.div`
//   display: flex;
//   align-items: center;
// `;
//
// const ResetButton = styled.img`
//   margin-right: 5px !important;
//   height: 10px !important;
//   width: 10px !important;
//   margin-left: 10px !important;
//   cursor: pointer;
// `;
//
// export const FilterSection: React.FC = () => {
//   const [doctorOptionList, setDoctorOptionList] = useState<
//     {
//       value: number | null;
//       label: string;
//     }[]
//   >([]);
//
//   const updateFilter = (data: PatientListFiltersType | null): void => {
//     setDisplaySettingsMainPatientTable({
//       patientListFilters: data,
//       pageNumber: 1,
//     });
//     getPatientListMainTableAction({
//       force: true,
//     });
//   };
//
//   const fetchDoctorOptionList = (): void => {
//     if (!doctorOptionList.length) {
//       const token = store.getState().auth.token;
//       userList({
//         role: UserRole.DOCTOR,
//         token,
//         noPagination: true,
//       }).then(({ result }) => {
//         setDoctorOptionList([
//           { value: -1, label: "--- UNASSIGNED ---" }, // recognize on backend that this is unassigned
//           ...result?.map((doctor) => {
//             return {
//               value: doctor.id,
//               label: `${doctor.first_name} ${doctor.last_name}`,
//             };
//           }),
//         ]);
//       });
//     }
//   };
//
//   const {
//     patientListFilters,
//   }: PatientListMainTableDisplaySettingsType = useSelector(
//     (state: RootState) => state.patient.patientListMainTableDisplaySettings
//   );
//
//   return (
//     <Wrapper>
//       <StyledP>Filter by:</StyledP>
//       <FilterButtonWrapper>
//         <SubMenuDropdownButton
//           selectedOption={patientListFilters.patientFilter}
//           setSelectedOption={(patientFilter): void => {
//             updateFilter({
//               ...patientListFilters,
//               patientFilter,
//             });
//           }}
//           menuOptions={[
//             { value: "af", label: "Activated" },
//             { value: "al", label: "Not activated" },
//             { value: "aa", label: "Account archived" },
//           ]}
//           placeholder={"Patient"}
//           showReset={true}
//         />
//         <CustomDropdownWrapper onClick={(): void => fetchDoctorOptionList()}>
//           <CustomDropdown
//             isSearchable={true}
//             isMulti={false}
//             placeholder={
//               <StyledP color={""}>
//                 <PlusImg src={require("../../../img/plus-white.png").default} />
//                 Doctor
//               </StyledP>
//             }
//             options={doctorOptionList}
//             onChange={(doctorFilter: {
//               label: string;
//               value: number;
//             }): void => {
//               updateFilter({
//                 ...patientListFilters,
//                 doctorFilter,
//               });
//             }}
//             selected={patientListFilters.doctorFilter}
//             // @ts-ignore
//             customClassName="main-table-dropdown-doctor-filter"
//           />
//           {patientListFilters.doctorFilter && (
//             <ResetButton
//               onClick={(): void => {
//                 updateFilter({
//                   ...patientListFilters,
//                   doctorFilter: null,
//                 });
//               }}
//               src={require("../../../img/x-dark-green.png").default}
//             />
//           )}
//         </CustomDropdownWrapper>
//         <DateRangePicker
//           selectedOption={patientListFilters.dobFilter}
//           setSelectedOption={(dobFilter): void => {
//             updateFilter({
//               ...patientListFilters,
//               dobFilter,
//             });
//           }}
//           placeholder={"DOB"}
//           showReset={true}
//         />
//         <SubMenuDropdownButton
//           selectedOption={patientListFilters.statusFilter}
//           setSelectedOption={(statusFilter): void => {
//             updateFilter({
//               ...patientListFilters,
//               statusFilter,
//             });
//           }}
//           menuOptions={[
//             { value: "fc", label: "Forms completed" },
//             { value: "fs", label: "Forms sent" },
//             { value: "fip", label: "Forms filling in progress" },
//           ]}
//           placeholder={"Status"}
//           showReset={true}
//         />
//       </FilterButtonWrapper>
//     </Wrapper>
//   );
// };
