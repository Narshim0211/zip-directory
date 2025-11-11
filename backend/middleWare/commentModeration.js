function moderateText(req, res, next) {
  const banned = ['spam', 'scam', 'fake'];
  const text = (req.body && req.body.text) || '';
  if (banned.some((word) => text.toLowerCase().includes(word))) {
    return res.status(400).json({ message: 'Inappropriate content detected.' });
  }
  next();
}

module.exports = { moderateText };
