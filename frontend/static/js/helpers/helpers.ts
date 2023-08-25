export const getImagePath = (folderName: string, imageName: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(`../img/${folderName}/${imageName}.png`).default;
};
