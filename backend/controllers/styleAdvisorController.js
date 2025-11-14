const styleAdvisorService = require('../services/styleAdvisorMicroservice');

const handleServiceCall = async (res, fn) => {
  try {
    const result = await fn();
    res.json(result);
  } catch (err) {
    if (err.status && err.data) {
      return res.status(err.status).json(err.data);
    }
    return res.status(500).json({
      success: false,
      code: 'AI_STYLE_UNKNOWN_ERROR',
      message: err.message || 'Unexpected Style Advisor error',
    });
  }
};

const hairTryOn = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      code: 'AI_INPUT_PHOTO_REQUIRED',
      message: 'Upload a selfie to continue.',
    });
  }

  if (!req.body?.styleId) {
    return res.status(400).json({
      success: false,
      code: 'AI_STYLE_ID_REQUIRED',
      message: 'Select a hairstyle.',
    });
  }

  return handleServiceCall(res, () =>
    styleAdvisorService.hairTryOn({
      user: req.user,
      styleId: req.body.styleId,
      photo: req.file,
    })
  );
};

const outfitTryOn = (req, res) => {
  const basePhoto = req.files?.photo?.[0];
  const outfitPhoto = req.files?.outfit?.[0];
  if (!basePhoto) {
    return res.status(400).json({
      success: false,
      code: 'AI_BASE_PHOTO_REQUIRED',
      message: 'Upload a full or half body photo.',
    });
  }
  if (!outfitPhoto && !req.body?.presetId) {
    return res.status(400).json({
      success: false,
      code: 'AI_OUTFIT_REQUIRED',
      message: 'Upload an outfit image or choose a preset.',
    });
  }

  return handleServiceCall(res, () =>
    styleAdvisorService.outfitTryOn({
      user: req.user,
      basePhoto,
      outfitPhoto,
      presetId: req.body?.presetId,
    })
  );
};

const askQuestion = (req, res) => {
  if (!req.body?.question) {
    return res.status(400).json({
      success: false,
      code: 'AI_QUESTION_REQUIRED',
      message: 'Ask a question to receive advice.',
    });
  }

  return handleServiceCall(res, () =>
    styleAdvisorService.askQuestion({
      user: req.user,
      question: req.body.question,
    })
  );
};

const getProfile = (req, res) =>
  handleServiceCall(res, () =>
    styleAdvisorService.getProfile({
      user: req.user,
    })
  );

const saveProfile = (req, res) =>
  handleServiceCall(res, () =>
    styleAdvisorService.saveProfile({
      user: req.user,
      payload: req.body,
    })
  );

module.exports = {
  hairTryOn,
  outfitTryOn,
  askQuestion,
  getProfile,
  saveProfile,
};
