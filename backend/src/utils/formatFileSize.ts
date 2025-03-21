export const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${(size / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};
