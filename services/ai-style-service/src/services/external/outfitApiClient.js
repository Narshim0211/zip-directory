const axios = require('axios');
const { env } = require('../../config/env');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildBaseUrl = () => {
  const vendor = env.externalApis.xDesign;
  if (!vendor?.baseUrl) return null;
  return vendor.baseUrl.endsWith('/')
    ? vendor.baseUrl.slice(0, -1)
    : vendor.baseUrl;
};

const buildHeaders = () => {
  const vendor = env.externalApis.xDesign;
  if (!vendor?.apiKey) return null;
  return {
    'X-Api-Key': vendor.apiKey,
    'Content-Type': 'application/json',
  };
};

const createTask = async (body) => {
  const baseUrl = buildBaseUrl();
  const headers = buildHeaders();
  if (!baseUrl || !headers) {
    return null;
  }
  const response = await axios.post(`${baseUrl}/clothing-tasks`, body, {
    headers,
    timeout: 20000,
  });

  if (response.status !== 200) {
    throw new Error(response.data?.message || 'Failed to create outfit task');
  }

  return response.data?.data?.taskId;
};

const pollTask = async (taskId) => {
  const baseUrl = buildBaseUrl();
  const headers = buildHeaders();
  const vendor = env.externalApis.xDesign;
  const deadline = Date.now() + (vendor?.pollTimeoutMs || 120000);

  while (Date.now() < deadline) {
    const response = await axios.get(`${baseUrl}/clothing-tasks/${taskId}`, {
      headers,
      timeout: 15000,
    });

    if (response.status !== 200) {
      throw new Error(response.data?.message || 'Failed to check outfit task');
    }

    const taskInfo = response.data?.data;

    if (!taskInfo) {
      throw new Error('Missing task info from X-Design');
    }

    if (taskInfo.status === 'error') {
      throw new Error(taskInfo.message || 'X-Design returned an error');
    }

    if (taskInfo.status === 'success') {
      const firstResult = taskInfo.results?.[0];
      if (firstResult?.downloadUrl) {
        return firstResult.downloadUrl;
      }
      throw new Error('X-Design completed without a download URL');
    }

    await wait(vendor?.pollIntervalMs || 4000);
  }

  throw new Error('X-Design outfit task timed out');
};

async function callVendor(payload) {
  const vendor = env.externalApis.xDesign;
  if (!vendor?.baseUrl || !vendor?.apiKey) {
    return {
      imageUrl: env.fallbackImage,
      vendorLatency: 0,
      note: 'X-Design API not configured',
    };
  }

  const imageSource = payload.outfitImage || payload.baseImage;
  if (!imageSource) {
    throw new Error('No outfit/base image provided for rendering');
  }

  const requestBody = {
    image: imageSource,
    modelId: vendor.modelId,
    sceneType: vendor.sceneType,
    sceneId: payload.sceneId || vendor.defaultSceneId,
  };

  const start = Date.now();
  const taskId = await createTask(requestBody);
  if (!taskId) {
    return {
      imageUrl: env.fallbackImage,
      vendorLatency: 0,
      note: 'Task creation skipped; missing API credentials',
    };
  }

  const downloadUrl = await pollTask(taskId);

  return {
    imageUrl: downloadUrl,
    vendorLatency: Date.now() - start,
  };
}

module.exports = {
  generate: callVendor,
};
