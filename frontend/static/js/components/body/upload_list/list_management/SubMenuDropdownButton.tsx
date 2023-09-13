// /* eslint-disable @typescript-eslint/no-var-requires */
//
// import React, { useEffect, useRef, useState } from "react";
// import styled from "styled-components";
// import {
//   DoctorListSortType,
//   PatientListSortType,
// } from "../toolbar/user/UserListActions";
//
// interface StyledPProps {
//   color?: string;
// }
//
// const StyledP = styled.p<StyledPProps>`
//   font-size: 12px;
//   margin-right: 24px;
//   color: ${({ color }): string => color || "#3c5153"} !important;
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
// const DropdownContainer = styled.div`
//   position: relative;
//   display: inline-block;
//   display: flex;
//   align-items: center;
//   box-sizing: border-box;
// `;
//
// interface MenuProps {
//   isOpen: boolean;
// }
//
// const DropdownMenu = styled.div<MenuProps>`
//   display: ${({ isOpen }): string => (isOpen ? "block" : "none")};
//   position: absolute;
//   top: 50px;
//   left: 0;
//   min-width: 250px;
//   z-index: 9;
//   background-color: #f9f9f9;
//   box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
// `;
//
// const DropdownItem = styled.div`
//   color: black;
//   padding: 12px 16px;
//   text-decoration: none;
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   cursor: pointer;
//   position: relative;
//
//   &:hover {
//     background-color: #f1f1f1;
//   }
// `;
//
// const ArrowIcon = styled.span`
//   margin-left: 10px;
// `;
//
// const Submenu = styled.div<MenuProps>`
//   display: ${({ isOpen }): string => (isOpen ? "block" : "none")};
//   position: absolute;
//   left: 100%;
//   top: 0;
//   min-width: 250px;
//   z-index: 1;
//   background-color: #f9f9f9;
//   box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
// `;
//
// const AddFilterButton = styled.div`
//   display: flex;
//   color: white;
//   background-color: #84b1b4;
//   padding: 0 10px 0 15px;
//   align-items: center;
//   border-radius: 10px;
//   cursor: pointer;
//   position: relative;
//   height: 46px !important;
// `;
//
// const PlusImg = styled.img`
//   margin-right: 5px !important;
//   height: 10px !important;
//   width: 10px !important;
// `;
//
// export interface DropdownTreeMenuItem {
//   label: string;
//   value?: DoctorListSortType | PatientListSortType;
//   subItems?: DropdownTreeMenuItem[];
// }
//
// interface Props {
//   selectedOption: DropdownTreeMenuItem | null;
//   setSelectedOption: (value: DropdownTreeMenuItem | null) => void;
//   menuOptions: DropdownTreeMenuItem[];
//   placeholder?: string;
//   label?: string;
//   showReset?: boolean;
// }
//
// export const SubMenuDropdownButton: React.FC<Props> = ({
//   selectedOption,
//   setSelectedOption,
//   menuOptions,
//   placeholder,
//   label,
//   showReset = false,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [activeMenu, setActiveMenu] = useState<string | null>(null);
//   const [menuLabel, setMenuLabel] = useState<string | null>(null);
//   const ref = useRef<HTMLDivElement>(null);
//
//   useEffect(() => {
//     const checkIfClickedOutside = (e: MouseEvent): void => {
//       if (isOpen && ref.current && !ref.current.contains(e.target as Node)) {
//         setIsOpen(false);
//         setActiveMenu(null);
//       }
//     };
//
//     document.addEventListener("mousedown", checkIfClickedOutside);
//
//     return (): void => {
//       document.removeEventListener("mousedown", checkIfClickedOutside);
//     };
//   }, [isOpen]);
//
//   const handleButtonClick = (): void => {
//     setIsOpen(!isOpen);
//   };
//
//   const handleClearClick = (): void => {
//     setIsOpen(false);
//     setActiveMenu(null);
//     setSelectedOption(null);
//     setMenuLabel(null);
//   };
//
//   const handleItemClick = (
//     item: DropdownTreeMenuItem,
//     hasSubItems: boolean
//   ): void => {
//     if (hasSubItems) {
//       if (activeMenu === item.label) {
//         setActiveMenu(null);
//       } else {
//         setActiveMenu(item.label);
//       }
//     } else {
//       setSelectedOption(item);
//       setIsOpen(false);
//       setMenuLabel(activeMenu);
//     }
//   };
//
//   const renderMenuItems = (items: DropdownTreeMenuItem[]): JSX.Element[] =>
//     items.map((item, index) => (
//       <DropdownItem
//         /* eslint-disable-next-line react/no-array-index-key */
//         key={index}
//         onClick={(): void => handleItemClick(item, !!item.subItems)}
//       >
//         <span>{item.label}</span>
//         {item.subItems && <ArrowIcon>▶</ArrowIcon>}
//         {item.subItems && activeMenu === item.label && (
//           <Submenu isOpen={activeMenu === item.label}>
//             {renderMenuItems(item.subItems)}
//           </Submenu>
//         )}
//       </DropdownItem>
//     ));
//
//   return (
//     <DropdownContainer>
//       {label ? <StyledP>{label}</StyledP> : null}
//       <DropdownContainer ref={ref}>
//         <AddFilterButton onClick={handleButtonClick}>
//           <StyledP color={"white"}>
//             {selectedOption ? (
//               `${menuLabel ? `${menuLabel}: ` : ""}${selectedOption.label}`
//             ) : (
//               <>
//                 <PlusImg src={require("../../../img/plus-white.png").default} />
//                 {placeholder}
//               </>
//             )}
//           </StyledP>
//         </AddFilterButton>
//         <DropdownMenu isOpen={isOpen}>
//           {renderMenuItems(menuOptions)}
//         </DropdownMenu>
//         {showReset && selectedOption && (
//           <ResetButton
//             onClick={handleClearClick}
//             src={require("../../../img/x-dark-green.png").default}
//           />
//         )}
//       </DropdownContainer>
//     </DropdownContainer>
//   );
// };
