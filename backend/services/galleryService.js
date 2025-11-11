const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const STORAGE_DIR = path.resolve(__dirname, "..", "uploads", "gallery");

const ensureStorageDir = async () => {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
};

const buildFileName = (originalName = "media.bin") => {
  const safeExt = path.extname(originalName) || ".bin";
  const stamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `${stamp}-${random}${safeExt}`;
};

const uploadGalleryMedia = async ({ buffer, originalName, folder = "" }) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Buffer data is required to store gallery media");
  }

  await ensureStorageDir();
  const fileName = buildFileName(originalName);
  const folderPath = folder ? path.join(STORAGE_DIR, folder) : STORAGE_DIR;
  await fs.mkdir(folderPath, { recursive: true });
  const destPath = path.join(folderPath, fileName);
  await fs.writeFile(destPath, buffer);

  return {
    url: `/uploads/gallery/${folder ? `${folder}/` : ""}${fileName}`,
    path: destPath,
    fileName,
    folder,
  };
};

const uploadBase64 = async ({ base64, originalName, folder = "" }) => {
  if (!base64) {
    throw new Error("Base64 payload is required");
  }
  const buffer = Buffer.from(base64, "base64");
  return uploadGalleryMedia({ buffer, originalName, folder });
};

module.exports = {
  uploadGalleryMedia,
  uploadBase64,
};
