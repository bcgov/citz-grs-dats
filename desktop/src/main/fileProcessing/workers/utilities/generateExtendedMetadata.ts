export const generateExtendedMetadata = async (metadata) => {
  console.log("[worker] Generating extended metadata.", metadata);
  const newMetadata = {...metadata};
  newMetadata.extended = {};
  return newMetadata;
};
