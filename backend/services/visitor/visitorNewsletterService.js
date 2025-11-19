const User = require('../../models/User');

/**
 * Visitor Newsletter Service
 * Handles newsletter subscription management for visitors
 */

/**
 * Subscribe visitor to hair tips newsletter
 */
async function subscribe(userId) {
  const user = await User.findById(userId);
  
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  if (user.role !== 'visitor') {
    const err = new Error('Only visitors can subscribe to hair tips newsletter');
    err.status = 403;
    throw err;
  }
  
  if (!user.newsletter) {
    user.newsletter = {};
  }
  
  user.newsletter.hairTips = true;
  await user.save();
  
  return {
    success: true,
    message: 'Successfully subscribed to hair tips newsletter',
    subscribed: true,
  };
}

/**
 * Unsubscribe visitor from hair tips newsletter
 */
async function unsubscribe(userId) {
  const user = await User.findById(userId);
  
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  if (user.role !== 'visitor') {
    const err = new Error('Only visitors can unsubscribe from hair tips newsletter');
    err.status = 403;
    throw err;
  }
  
  if (!user.newsletter) {
    user.newsletter = {};
  }
  
  user.newsletter.hairTips = false;
  await user.save();
  
  return {
    success: true,
    message: 'Successfully unsubscribed from hair tips newsletter',
    subscribed: false,
  };
}

/**
 * Get visitor's current newsletter subscription status
 */
async function getStatus(userId) {
  const user = await User.findById(userId).select('newsletter role');
  
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  if (user.role !== 'visitor') {
    const err = new Error('Only visitors have hair tips newsletter preferences');
    err.status = 403;
    throw err;
  }
  
  return {
    subscribed: user.newsletter?.hairTips || false,
  };
}

module.exports = {
  subscribe,
  unsubscribe,
  getStatus,
};
