const galleryService = require("../../services/galleryService");
const ownerBusinessService = require("../../services/owner/ownerBusinessService");

const uploadGalleryMedia = async (req, res) => {
  const { url, base64, fileName } = req.body || {};
  if (!url && !base64) {
    return res.status(400).json({ message: "Either url or base64 data is required" });
  }

  try {
    let mediaUrl = url;
    if (base64) {
      const payload = await galleryService.uploadBase64({
        base64,
        originalName: fileName || "gallery-media.png",
        folder: String(req.user._id),
      });
      mediaUrl = payload.url;
    }

    const business = await ownerBusinessService.addGalleryMedia(req.user._id, mediaUrl);
    return res.status(201).json({ business, mediaUrl });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const removeGalleryMedia = async (req, res) => {
  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ message: "media url is required" });
  }
  try {
    const business = await ownerBusinessService.removeGalleryMedia(req.user._id, url);
    return res.json({ business });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  uploadGalleryMedia,
  removeGalleryMedia,
};
