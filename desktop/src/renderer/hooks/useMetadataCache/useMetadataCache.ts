import { useCallback, useEffect, useState } from "react";

export const useMetadataCache = () => {
  const [cachedFolders, setCachedFolders] = useState<MetadataCacheEntry[]>([]);

  const refresh = useCallback(async () => {
    try {
      const entries = await window.api.getMetadataCacheEntries();
      setCachedFolders(entries);
    } catch (error) {
      console.error("Failed to fetch metadata cache entries:", error);
      setCachedFolders([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearAll = useCallback(async () => {
    const entries = await window.api.getMetadataCacheEntries();
    for (const entry of entries) {
      await window.api.deleteMetadataState(entry.sourcePath);
    }
    setCachedFolders([]);
  }, []);

  return { cachedFolders, refresh, clearAll };
};
