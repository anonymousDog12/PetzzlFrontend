export const convertPHtoAssetsUri = (phUri) => {
  const uriId = phUri.split("/")[2];
  return `assets-library://asset/asset.mp4?id=${uriId}&ext=mp4`;
};
