const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

const baseUrl = process.env.AI_STYLE_SERVICE_URL || 'http://localhost:6004/api/ai';
const internalKey = process.env.AI_STYLE_SERVICE_KEY || '';

const buildPlanType = (user = {}) => {
  const candidate =
    user.subscriptionPlan ||
    user.planType ||
    user.plan ||
    user.paymentPlan ||
    user.tier ||
    user.subscription?.plan;
  return (candidate || 'basic').toString().toLowerCase();
};

const buildHeaders = (user) => {
  if (!internalKey) {
    throw new Error('AI_STYLE_SERVICE_KEY is not configured');
  }
  return {
    'x-internal-api-key': internalKey,
    'x-user-id': user._id?.toString(),
    'x-user-role': user.role,
    'x-plan-type': buildPlanType(user),
  };
};

const callService = async ({ method = 'post', path, data, formData, user }) => {
  const url = `${baseUrl}${path}`;
  const headers = buildHeaders(user);
  let body = data;

  if (formData) {
    Object.assign(headers, formData.getHeaders());
    body = formData;
  }

  try {
    const config = {
      method,
      url,
      headers,
      timeout: 25000,
    };
    if (body !== undefined) {
      config.data = body;
    }
    const response = await axios(config);
    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    logger.error(
      `[StyleAdvisorMicroservice] ${method.toUpperCase()} ${path} failed ${status} - ${payload?.message}`
    );
    if (error.response) {
      throw {
        status,
        data: payload,
      };
    }
    throw {
      status: 503,
      data: { success: false, code: 'AI_SERVICE_UNAVAILABLE', message: 'Style Advisor service unavailable' },
    };
  }
};

const hairTryOn = async ({ user, styleId, photo }) => {
  const form = new FormData();
  form.append('styleId', styleId);
  form.append('photo', photo.buffer, {
    filename: photo.originalname || 'photo.jpg',
    contentType: photo.mimetype,
  });

  return callService({
    path: '/hair-tryon',
    formData: form,
    user,
  });
};

const outfitTryOn = async ({ user, basePhoto, outfitPhoto, presetId }) => {
  const form = new FormData();
  form.append('photo', basePhoto.buffer, {
    filename: basePhoto.originalname || 'photo.jpg',
    contentType: basePhoto.mimetype,
  });
  if (outfitPhoto) {
    form.append('outfit', outfitPhoto.buffer, {
      filename: outfitPhoto.originalname || 'outfit.png',
      contentType: outfitPhoto.mimetype,
    });
  }
  if (presetId) {
    form.append('presetId', presetId);
  }

  return callService({
    path: '/outfit-tryon',
    formData: form,
    user,
  });
};

const askQuestion = ({ user, question }) =>
  callService({
    path: '/qa',
    data: { question },
    user,
  });

const getProfile = ({ user }) =>
  callService({
    method: 'get',
    path: '/profile',
    user,
    data: undefined,
  });

const saveProfile = ({ user, payload }) =>
  callService({
    path: '/profile',
    data: payload,
    user,
  });

module.exports = {
  hairTryOn,
  outfitTryOn,
  askQuestion,
  getProfile,
  saveProfile,
};
