const User = require('../../models/User');

/**
 * Owner Newsletter Service
 * Handles newsletter subscription management for business owners
 */

/**
 * Subscribe owner to business growth newsletter
 */
async function subscribe(userId) {
  const user = await User.findById(userId);
  
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  if (user.role !== 'owner') {
    const err = new Error('Only business owners can subscribe to business growth newsletter');
    err.status = 403;
    throw err;
  }
  
  if (!user.newsletter) {
    user.newsletter = {};
  }
  
  user.newsletter.businessGrowth = true;
  await user.save();
  
  return {
    success: true,
    message: 'Successfully subscribed to business growth newsletter',
    subscribed: true,
  };
}

/**
 * Unsubscribe owner from business growth newsletter
 */
async function unsubscribe(userId) {
  const user = await User.findById(userId);
  
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  if (user.role !== 'owner') {
    const err = new Error('Only business owners can unsubscribe from business growth newsletter');
    err.status = 403;
    throw err;
  }
  
  if (!user.newsletter) {
    user.newsletter = {};
  }
  
  user.newsletter.businessGrowth = false;
  await user.save();
  
  return {
    success: true,
    message: 'Successfully unsubscribed from business growth newsletter',
    subscribed: false,
  };
}

/**
 * Get owner's current newsletter subscription status
 */
async function getStatus(userId) {
  const user = await User.findById(userId).select('newsletter role');
  
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  if (user.role !== 'owner') {
    const err = new Error('Only business owners have business growth newsletter preferences');
    err.status = 403;
    throw err;
  }
  
  return {
    subscribed: user.newsletter?.businessGrowth || false,
  };
}

module.exports = {
  subscribe,
  unsubscribe,
  getStatus,
};
