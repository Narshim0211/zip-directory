const Business = require("../../models/Business");

const ensureBusinessOwner = async (ownerId, payload = {}) => {
  // CRITICAL: Fetch existing business to preserve admin-controlled fields
  const existingBusiness = await Business.findOne({ owner: ownerId });

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

  // Only include listingType if provided and valid
  if (payload.listingType && ["free", "premium"].includes(payload.listingType)) {
    update.listingType = payload.listingType;
  }

  // CRITICAL: Preserve admin-controlled status field (pending/approved/rejected)
  // Owners can edit their business, but status can only be changed by admins
  if (existingBusiness && existingBusiness.status) {
    update.status = existingBusiness.status;
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
