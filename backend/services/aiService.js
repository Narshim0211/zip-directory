const Goal = require('../models/Goal');
const StyleInspiration = require('../models/StyleInspiration');

function normalize(tags = []) {
  return [...new Set((tags || []).map((t) => (t || '').toLowerCase()))];
}

async function buildContext(userId) {
  const [goals, styles] = await Promise.all([
    Goal.find({ user: userId }).select('title category status'),
    StyleInspiration.find({ user: userId }).select('tags'),
  ]);
  return {
    goals: goals.map((g) => ({ title: g.title, category: g.category, status: g.status })),
    tags: normalize(styles.flatMap((s) => s.tags)),
  };
}

function generateSuggestions({ question, goals, tags }) {
  const suggestions = [];
  const base = (question || 'You want a new look').trim();
  if (tags.includes('color') || goals.some((g) => g.category === 'color')) {
    suggestions.push('Try a low-maintenance balayage with warm honey tones to keep color fresh for weeks.');
  }
  if (tags.includes('beard')) {
    suggestions.push('A tapered beard fade with defined cheek lines keeps things sharp between trims.');
  }
  if (tags.includes('skin') || goals.some((g) => g.category === 'skin')) {
    suggestions.push('Streamline your routine: gentle exfoliation 3x/week plus SPF each morning keeps skin glowy.');
  }
  if (tags.includes('length') || goals.some((g) => g.category === 'length')) {
    suggestions.push('Layered trims every 8 weeks protect length while keeping movement.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Ask your stylist for a versatile cut that flatters your face shape and works with your daily routine.');
  }
  suggestions.unshift(`Question: ${base}`);
  return suggestions.slice(0, 4);
}

async function advise(userId, question) {
  const context = await buildContext(userId);
  const suggestions = generateSuggestions({ question, goals: context.goals, tags: context.tags });
  return suggestions;
}

module.exports = { advise };
