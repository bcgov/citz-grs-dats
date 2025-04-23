// Used to escape "." characters from record/map keys when stored in mongo or validated using zod

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const encodeKeysBase64 = (input: any): Map<string, any> => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const result = new Map<string, any>();
  for (const [key, value] of Object.entries(input)) {
    const encodedKey = Buffer.from(key, "utf8").toString("base64");
    result.set(encodedKey, value);
  }
  return result;
};

// biome-ignore lint/suspicious/noExplicitAny: used to support flexible input types
export const encodeKeysBase64AsObject = (input: any): Record<string, any> => {
  const mapResult = encodeKeysBase64(input);
  // biome-ignore lint/suspicious/noExplicitAny: used to support flexible input types
  const objResult: Record<string, any> = {};
  for (const [key, value] of mapResult.entries()) {
    objResult[key] = value;
  }
  return objResult;
};

export const decodeKeysBase64 = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  input: any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Record<string, any> => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const decoded: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    const decodedKey = Buffer.from(key, "base64").toString("utf8");
    decoded[decodedKey] = value;
  }
  return decoded;
};
