const Article = require('../models/Article');
const Goal = require('../models/Goal');
const User = require('../models/User');

function goalTag(category) {
  const map = {
    length: 'length',
    color: 'color',
    style: 'style',
    beard: 'beard',
    skin: 'skin',
    nails: 'nails',
  };
  return map[category] || 'style';
}

async function buildTags(userId) {
  const [user, goals] = await Promise.all([
    User.findById(userId).populate({ path: 'favorites', select: 'category' }),
    Goal.find({ user: userId }),
  ]);
  const tags = new Set();
  (user?.favorites || []).forEach((biz) => {
    if (biz?.category) tags.add(biz.category.toLowerCase());
  });
  (goals || []).forEach((goal) => tags.add(goalTag(goal.category)));
  return Array.from(tags);
}

async function feedFor(userId, limit = 10) {
  const tags = await buildTags(userId);
  if (tags.length > 0) {
    const targeted = await Article.find({ published: true, tags: { $in: tags } })
      .sort({ createdAt: -1 })
      .limit(limit);
    if (targeted.length > 0) return targeted;
  }
  return Article.find({ published: true }).sort({ createdAt: -1 }).limit(limit);
}

async function createArticle(payload) {
  const { title, summary, body, coverImage, tags, published, author } = payload || {};
  if (!title || !title.trim()) {
    const err = new Error('Title is required');
    err.status = 400;
    throw err;
  }
  const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const article = new Article({
    title: title.trim(),
    summary,
    body,
    coverImage,
    tags: Array.isArray(tags) ? tags.map((t) => t.toLowerCase()) : [],
    published: Boolean(published),
    author,
    slug: `${slugBase}-${Date.now()}`,
  });
  return article.save();
}

module.exports = { feedFor, createArticle };
