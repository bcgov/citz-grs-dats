export const parseJsonFile = (fileList?: File | null): Promise<object> => {
  return new Promise((resolve, reject) => {
    if (fileList) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const jsonObject = JSON.parse(event.target.result as string);
            resolve(jsonObject);
          } else {
            reject(new Error("File content is empty."));
          }
        } catch (error) {
          reject(new Error("Invalid JSON file."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the file."));
      };

      reader.readAsText(fileList);
    }
  });
};
