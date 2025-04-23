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
