export const runWithConcurrencyLimit = async <T>(
  tasks: (() => Promise<T>)[],
  limit = 5
): Promise<T[]> => {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then((result) => {
      results.push(result);
    });
    executing.push(p);

    if (executing.length >= limit) {
      // Wait until one finishes
      await Promise.race(executing);
      // Remove all settled promises
      const settled = await Promise.allSettled(executing);
      for (let i = executing.length - 1; i >= 0; i--) {
        if (
          settled[i].status === "fulfilled" ||
          settled[i].status === "rejected"
        ) {
          executing.splice(i, 1);
        }
      }
    }
  }

  // Wait for remaining tasks
  await Promise.all(executing);
  return results;
};
