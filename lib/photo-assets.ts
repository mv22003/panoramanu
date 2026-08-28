import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const uploadsDirPath = path.join(process.cwd(), "public", "uploads");

function getExtension(filename: string) {
  const extension = path.extname(filename).toLowerCase();

  if (extension) {
    return extension;
  }

  return ".jpg";
}

export async function saveUploadedPhoto(file: File) {
  if (!file || file.size === 0) {
    return "";
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Uploaded files must be images.");
  }

  await fs.mkdir(uploadsDirPath, { recursive: true });

  const filename = `${randomUUID()}${getExtension(file.name)}`;
  const filePath = path.join(uploadsDirPath, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}
