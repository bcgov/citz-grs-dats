import pako from 'pako';

export const compress = (payload: any): string => {
    // Step 1: Convert the payload to a JSON string
    const jsonString = JSON.stringify(payload);

    // Step 2: Compress the JSON string
    //const compressedData = pako.gzip(jsonString);

    // Step 3: Convert the compressed data to a Base64 string
    const base64CompressedData = btoa(jsonString);

    return base64CompressedData;
}