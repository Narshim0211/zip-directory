const Business = require("../../models/Business");

const ensureBusinessOwner = async (ownerId, payload = {}) => {
  const update = {
    owner: ownerId,
    name: payload.name,
    city: payload.city,
    address: payload.address,
    zip: payload.zip,
    description: payload.description,
    category: payload.category,
    state: payload.state,
  };

  // Only include businessType if provided and valid
  if (payload.businessType && ["salon", "spa", "freelance"].includes(payload.businessType)) {
    update.businessType = payload.businessType;
  }

  const options = { new: true, upsert: true, setDefaultsOnInsert: true };
  return Business.findOneAndUpdate({ owner: ownerId }, { $set: update }, options);
};

const findBusinessByOwner = async (ownerId) => {
  return Business.findOne({ owner: ownerId });
};

const upsertBusiness = async (ownerId, payload) => ensureBusinessOwner(ownerId, payload);

const addGalleryMedia = async (ownerId, mediaUrl) => {
  if (!mediaUrl) {
    throw new Error("mediaUrl is required to add gallery media");
  }
  return Business.findOneAndUpdate(
    { owner: ownerId },
    { $push: { images: mediaUrl } },
    { new: true, upsert: true }
  );
};

const removeGalleryMedia = async (ownerId, mediaUrl) => {
  if (!mediaUrl) throw new Error("mediaUrl is required to remove gallery media");
  return Business.findOneAndUpdate(
    { owner: ownerId },
    { $pull: { images: mediaUrl } },
    { new: true }
  );
};

module.exports = { findBusinessByOwner, upsertBusiness, addGalleryMedia, removeGalleryMedia };
