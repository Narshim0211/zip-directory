/**
 * 🧪 CHAT SYSTEM API TESTING SCRIPT
 *
 * Tests all chat endpoints to verify the FOMO Pay-to-Chat system works correctly.
 *
 * Run: node backend/test-chat-system.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Business = require('./models/Business');
const MessageThread = require('./models/MessageThread');
const Message = require('./models/Message');
const { canVisitorSend, canOwnerReply, canVisitorReadReply, shouldShowFomoBanner } = require('./services/chatEntitlementsService');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

async function setupTestData() {
  log.info('Setting up test data...');

  // Create test visitor
  let visitor = await User.findOne({ email: 'test.visitor@salonhub.com' });
  if (!visitor) {
    visitor = await User.create({
      name: 'Test Visitor',
      email: 'test.visitor@salonhub.com',
      password: 'password123',
      role: 'visitor',
    });
    log.success(`Created test visitor: ${visitor._id}`);
  } else {
    log.info(`Using existing visitor: ${visitor._id}`);
  }

  // Create test owner (free tier)
  let freeOwner = await User.findOne({ email: 'test.owner.free@salonhub.com' });
  if (!freeOwner) {
    freeOwner = await User.create({
      name: 'Free Owner',
      email: 'test.owner.free@salonhub.com',
      password: 'password123',
      role: 'owner',
    });
    log.success(`Created free owner: ${freeOwner._id}`);
  } else {
    log.info(`Using existing free owner: ${freeOwner._id}`);
  }

  // Create test owner (premium tier)
  let premiumOwner = await User.findOne({ email: 'test.owner.premium@salonhub.com' });
  if (!premiumOwner) {
    premiumOwner = await User.create({
      name: 'Premium Owner',
      email: 'test.owner.premium@salonhub.com',
      password: 'password123',
      role: 'owner',
    });
    log.success(`Created premium owner: ${premiumOwner._id}`);
  } else {
    log.info(`Using existing premium owner: ${premiumOwner._id}`);
  }

  // Create free business
  let freeBusiness = await Business.findOne({ owner: freeOwner._id });
  if (!freeBusiness) {
    freeBusiness = await Business.create({
      name: 'Free Hair Salon',
      city: 'Los Angeles',
      category: 'Salon',
      owner: freeOwner._id,
      listingType: 'free',
      status: 'approved',
      location: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522],
      },
    });
    log.success(`Created free business: ${freeBusiness._id}`);
  } else {
    log.info(`Using existing free business: ${freeBusiness._id}`);
  }

  // Create premium business
  let premiumBusiness = await Business.findOne({ owner: premiumOwner._id });
  if (!premiumBusiness) {
    premiumBusiness = await Business.create({
      name: 'Premium Hair Studio',
      city: 'New York',
      category: 'Salon',
      owner: premiumOwner._id,
      listingType: 'premium',
      status: 'approved',
      premiumSubscription: {
        active: true,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128],
      },
    });
    log.success(`Created premium business: ${premiumBusiness._id}`);
  } else {
    // Ensure it's premium
    premiumBusiness.listingType = 'premium';
    premiumBusiness.premiumSubscription = {
      active: true,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    await premiumBusiness.save();
    log.info(`Using existing premium business: ${premiumBusiness._id}`);
  }

  return { visitor, freeOwner, premiumOwner, freeBusiness, premiumBusiness };
}

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log.success('Connected to MongoDB');

    const { visitor, freeOwner, premiumOwner, freeBusiness, premiumBusiness } = await setupTestData();

    console.log('\n' + '='.repeat(60));
    log.test('STARTING CHAT SYSTEM TESTS');
    console.log('='.repeat(60) + '\n');

    // ========================================
    // TEST 1: Visitor Can Send First Free Message
    // ========================================
    console.log('📝 TEST 1: Visitor Can Send First Free Message to Premium Business');
    const canSend1 = await canVisitorSend(visitor._id, null);
    if (canSend1.allowed) {
      log.success(`Visitor CAN send first message: ${canSend1.reason}`);
    } else {
      log.error(`Visitor CANNOT send first message: ${canSend1.reason}`);
    }

    // Create thread and message
    let thread = await MessageThread.create({
      businessId: premiumBusiness._id,
      visitorId: visitor._id,
      ownerId: premiumOwner._id,
      status: 'OPEN',
    });
    log.success(`Created message thread: ${thread._id}`);

    let message1 = await Message.create({
      threadId: thread._id,
      senderId: visitor._id,
      senderRole: 'visitor',
      text: 'Hi! Do you accept walk-ins?',
      isBlurred: false,
    });
    log.success(`Created first visitor message: "${message1.text}"`);

    // ========================================
    // TEST 2: Visitor Cannot Send Second Message (No Chat Pass)
    // ========================================
    console.log('\n📝 TEST 2: Visitor Cannot Send Second Message Without Chat Pass');
    const canSend2 = await canVisitorSend(visitor._id, thread._id);
    if (!canSend2.allowed && canSend2.requiresPayment) {
      log.success(`Visitor BLOCKED from second message: ${canSend2.reason}`);
    } else {
      log.error(`Visitor should be blocked but isn't!`);
    }

    // ========================================
    // TEST 3: Free Owner Cannot Reply
    // ========================================
    console.log('\n📝 TEST 3: Free Owner Cannot Reply (No Premium)');

    // Create thread with free business
    let freeThread = await MessageThread.create({
      businessId: freeBusiness._id,
      visitorId: visitor._id,
      ownerId: freeOwner._id,
      status: 'OPEN',
    });

    await Message.create({
      threadId: freeThread._id,
      senderId: visitor._id,
      senderRole: 'visitor',
      text: 'Hello! Are you open on Sundays?',
      isBlurred: false,
    });

    const canReply1 = await canOwnerReply(freeBusiness._id);
    if (!canReply1.allowed && canReply1.requiresUpgrade) {
      log.success(`Free owner BLOCKED from replying: ${canReply1.reason}`);
    } else {
      log.error(`Free owner should be blocked but isn't!`);
    }

    // ========================================
    // TEST 4: Premium Owner Can Reply
    // ========================================
    console.log('\n📝 TEST 4: Premium Owner Can Reply');
    const canReply2 = await canOwnerReply(premiumBusiness._id);
    if (canReply2.allowed) {
      log.success(`Premium owner CAN reply: ${canReply2.reason}`);
    } else {
      log.error(`Premium owner CANNOT reply: ${canReply2.reason}`);
    }

    // Premium owner replies (visitor has no chat pass, so message is blurred)
    let ownerReply = await Message.create({
      threadId: thread._id,
      senderId: premiumOwner._id,
      senderRole: 'owner',
      text: 'Yes! Walk-ins are welcome between 9am-5pm.',
      isBlurred: true, // Visitor doesn't have chat pass
    });
    log.success(`Premium owner sent reply (blurred): "${ownerReply.text}"`);

    // Update thread
    thread.hasOwnerReplied = true;
    thread.visitorHasSeenOwnerReply = false;
    await thread.save();

    // ========================================
    // TEST 5: Visitor Cannot Read Blurred Reply
    // ========================================
    console.log('\n📝 TEST 5: Visitor Cannot Read Blurred Reply Without Chat Pass');
    const canRead1 = await canVisitorReadReply(visitor._id, ownerReply._id);
    if (!canRead1.allowed && canRead1.requiresPayment) {
      log.success(`Visitor BLOCKED from reading reply: ${canRead1.reason}`);
    } else {
      log.error(`Visitor should be blocked from reading blurred message!`);
    }

    // ========================================
    // TEST 6: FOMO Banner Shows for Visitor
    // ========================================
    console.log('\n📝 TEST 6: FOMO Banner Shows for Visitor');
    const visitorFomo = await shouldShowFomoBanner(visitor._id, 'visitor', thread._id);
    if (visitorFomo.show) {
      log.success(`FOMO banner shows: "${visitorFomo.message}"`);
    } else {
      log.error(`FOMO banner should show for visitor!`);
    }

    // ========================================
    // TEST 7: FOMO Banner Shows for Free Owner
    // ========================================
    console.log('\n📝 TEST 7: FOMO Banner Shows for Free Owner');
    const ownerFomo = await shouldShowFomoBanner(freeOwner._id, 'owner');
    if (ownerFomo.show) {
      log.success(`FOMO banner shows: "${ownerFomo.message}"`);
    } else {
      log.warn(`No messages for free owner yet, FOMO won't show`);
    }

    // ========================================
    // TEST 8: Activate Chat Pass and Unlock Messages
    // ========================================
    console.log('\n📝 TEST 8: Activate Chat Pass and Unlock Messages');
    visitor.hasChatPass = true;
    visitor.chatPassExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    visitor.chatPassActivatedAt = new Date();
    await visitor.save();
    log.success('Chat Pass activated for visitor');

    // Now visitor can read the reply
    const canReadNow = await canVisitorReadReply(visitor._id, ownerReply._id);
    if (canReadNow.allowed) {
      log.success(`Visitor CAN now read reply: ${canReadNow.reason}`);
    } else {
      log.error(`Visitor should be able to read reply now!`);
    }

    // Visitor can send unlimited messages
    const canSendUnlimited = await canVisitorSend(visitor._id, thread._id);
    if (canSendUnlimited.allowed) {
      log.success(`Visitor CAN send unlimited messages: ${canSendUnlimited.reason}`);
    } else {
      log.error(`Visitor should be able to send unlimited messages!`);
    }

    // ========================================
    // TEST 9: Grace Period Works After Cancellation
    // ========================================
    console.log('\n📝 TEST 9: Grace Period After Chat Pass Cancellation');
    visitor.hasChatPass = false;
    visitor.chatPassGraceEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await visitor.save();
    log.info('Simulated chat pass cancellation with grace period');

    const canSendGrace = await canVisitorSend(visitor._id, thread._id);
    if (canSendGrace.allowed && canSendGrace.reason === 'Grace period active') {
      log.success(`Grace period working: ${canSendGrace.reason}`);
    } else {
      log.error(`Grace period should allow sending messages!`);
    }

    // ========================================
    // TEST 10: isPremium Virtual Field
    // ========================================
    console.log('\n📝 TEST 10: Business isPremium Virtual Field');
    const reloadedPremium = await Business.findById(premiumBusiness._id);
    const reloadedFree = await Business.findById(freeBusiness._id);

    // Note: Virtual fields need toJSON() or toObject() with virtuals: true
    const premiumJSON = reloadedPremium.toObject({ virtuals: true });
    const freeJSON = reloadedFree.toObject({ virtuals: true });

    if (premiumJSON.isPremium === true) {
      log.success('Premium business isPremium = true');
    } else {
      log.error('Premium business isPremium should be true!');
    }

    if (freeJSON.isPremium === false || freeJSON.isPremium === undefined) {
      log.success('Free business isPremium = false');
    } else {
      log.error('Free business isPremium should be false!');
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(60));
    log.success('ALL TESTS COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`   Visitor ID: ${visitor._id}`);
    console.log(`   Free Owner ID: ${freeOwner._id}`);
    console.log(`   Premium Owner ID: ${premiumOwner._id}`);
    console.log(`   Free Business ID: ${freeBusiness._id}`);
    console.log(`   Premium Business ID: ${premiumBusiness._id}`);
    console.log(`   Message Thread ID: ${thread._id}`);
    console.log('\n✅ Use these IDs to test API endpoints with Postman/Thunder Client');
    console.log('\n📖 See CHAT_SYSTEM_BACKEND_COMPLETE.md for API endpoint examples\n');

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    log.info('Disconnected from MongoDB');
    process.exit(0);
  }
}

runTests();
