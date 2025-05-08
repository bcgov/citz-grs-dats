import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";

export const writeStreamToTempFile = async (
  stream: Readable
): Promise<string> => {
  const tempPath = path.join(tmpdir(), `${randomUUID()}.zip`);
  const writeStream = fs.createWriteStream(tempPath);
  await pipeline(stream, writeStream);
  return tempPath;
};
