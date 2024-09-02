/**
 * Normalize a file path for consistent comparison
 * @param {string} path - The file path to normalize
 * @returns {string} - The normalized file path
 */
const normalizePath = (path: string) => {
    return path
        .trim()                     // Remove leading/trailing whitespace
        .replace(/\\/g, '/')        // Replace backslashes with forward slashes
        .replace(/\/{2,}/g, '/')    // Replace multiple slashes with a single slash
        .toLowerCase();             // Convert to lowercase for case-insensitive comparison
}

/**
 * Compare two file paths for equality
 * @param {string} path1 - The first file path
 * @param {string} path2 - The second file path
 * @returns {boolean} - True if paths are equal, otherwise false
 */
export const arePathsEqual = (path1: string, path2 : string) => {
    const normalizedPath1 = normalizePath(path1);
    const normalizedPath2 = normalizePath(path2);
    return normalizedPath1 === normalizedPath2;
}
