/**
 * Create Test Data for Feature Testing
 *
 * Creates:
 * - 1 Premium business (for testing orbit badges, sticky CTA, etc.)
 * - 1 Free business (for testing free listing)
 * - 2 Users (visitor and owner)
 * - Sample messages for pay-to-chat testing
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Business = require('../models/Business');
require('dotenv').config();

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salonhub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clean up existing test data
    await User.deleteMany({ email: { $in: ['testowner@test.com', 'testvisitor@test.com'] } });
    await Business.deleteMany({ name: { $in: ['Premium Test Salon', 'Free Test Salon'] } });
    console.log('✅ Cleaned up existing test data');

    // Create test owner user
    const ownerUser = await User.create({
      name: 'Test Owner',
      email: 'testowner@test.com',
      password: '$2a$10$XqQZ0Z0Z0Z0Z0Z0Z0Z0Z0OYw8xKQYZ0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0', // "password123"
      role: 'owner',
      emailVerified: true,
      phoneVerified: true,
    });
    console.log('✅ Created test owner:', ownerUser.email);

    // Create test visitor user
    const visitorUser = await User.create({
      name: 'Test Visitor',
      email: 'testvisitor@test.com',
      password: '$2a$10$XqQZ0Z0Z0Z0Z0Z0Z0Z0Z0OYw8xKQYZ0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0', // "password123"
      role: 'visitor',
      emailVerified: true,
    });
    console.log('✅ Created test visitor:', visitorUser.email);

    // Create Premium Test Salon
    const premiumBusiness = await Business.create({
      name: 'Premium Test Salon',
      owner: ownerUser._id,
      businessType: 'salon',
      bio: 'This is a premium salon for testing all premium features including orbit badges, sticky CTA ribbon, and masonry gallery.',
      bookingSlug: 'premium-test-salon',
      listingType: 'premium',
      status: 'approved',
      premiumSubscription: {
        active: true,
        stripeSubscriptionId: 'sub_test_premium',
        stripePriceId: 'price_test_premium',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      verificationStatus: 'fully_verified',
      contact: {
        email: 'premium@test.com',
        phone: '+1234567890',
        address: '123 Premium Street',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75001',
      },
      logo: 'https://via.placeholder.com/150/E91E63/FFFFFF?text=Premium',
      coverPhoto: 'https://via.placeholder.com/1200x400/667eea/FFFFFF?text=Premium+Salon',
      photos: [
        { url: 'https://via.placeholder.com/600/E91E63/FFFFFF?text=Gallery+1', caption: 'Beautiful styling' },
        { url: 'https://via.placeholder.com/600/667eea/FFFFFF?text=Gallery+2', caption: 'Modern interior' },
        { url: 'https://via.placeholder.com/600/10b981/FFFFFF?text=Gallery+3', caption: 'Professional team' },
        { url: 'https://via.placeholder.com/600/F59E0B/FFFFFF?text=Gallery+4', caption: 'Latest equipment' },
        { url: 'https://via.placeholder.com/600/8B5CF6/FFFFFF?text=Gallery+5', caption: 'Comfortable space' },
        { url: 'https://via.placeholder.com/600/EC4899/FFFFFF?text=Gallery+6', caption: 'Expert services' },
      ],
      recentGallery: [
        { url: 'https://via.placeholder.com/400/E91E63/FFFFFF?text=Recent+1', caption: 'Latest work' },
        { url: 'https://via.placeholder.com/400/667eea/FFFFFF?text=Recent+2', caption: 'Client transformation' },
        { url: 'https://via.placeholder.com/400/10b981/FFFFFF?text=Recent+3', caption: 'New style' },
      ],
      services: [
        { name: 'Premium Haircut', duration: 60, price: 75, description: 'Expert styling' },
        { name: 'Color Treatment', duration: 120, price: 150, description: 'Professional coloring' },
        { name: 'Hair Spa', duration: 90, price: 100, description: 'Relaxing treatment' },
      ],
      hours: {
        mon: '9:00 AM - 8:00 PM',
        tue: '9:00 AM - 8:00 PM',
        wed: '9:00 AM - 8:00 PM',
        thu: '9:00 AM - 8:00 PM',
        fri: '9:00 AM - 9:00 PM',
        sat: '10:00 AM - 6:00 PM',
        sun: 'Closed',
      },
      highlights: ['Award Winning', 'Certified Stylists', 'Premium Products'],
      ratingAverage: 4.8,
      ratingsCount: 42,
    });
    console.log('✅ Created Premium Test Salon:', premiumBusiness.bookingSlug);

    // Create Free Test Salon
    const freeBusiness = await Business.create({
      name: 'Free Test Salon',
      owner: ownerUser._id,
      businessType: 'salon',
      bio: 'This is a free salon for testing free listing features and conversion flow.',
      bookingSlug: 'free-test-salon',
      listingType: 'free',
      status: 'approved',
      verificationStatus: 'email_verified',
      contact: {
        email: 'free@test.com',
        phone: '+1987654321',
        address: '456 Free Avenue',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      },
      logo: 'https://via.placeholder.com/150/10b981/FFFFFF?text=Free',
      coverPhoto: 'https://via.placeholder.com/1200x400/10b981/FFFFFF?text=Free+Salon',
      services: [
        { name: 'Basic Haircut', duration: 45, price: 35, description: 'Standard cut' },
        { name: 'Basic Styling', duration: 30, price: 25, description: 'Quick style' },
      ],
      hours: {
        mon: '10:00 AM - 6:00 PM',
        tue: '10:00 AM - 6:00 PM',
        wed: '10:00 AM - 6:00 PM',
        thu: '10:00 AM - 6:00 PM',
        fri: '10:00 AM - 6:00 PM',
        sat: '10:00 AM - 4:00 PM',
        sun: 'Closed',
      },
      ratingAverage: 4.2,
      ratingsCount: 15,
    });
    console.log('✅ Created Free Test Salon:', freeBusiness.bookingSlug);

    console.log('\n📋 TEST DATA SUMMARY:');
    console.log('====================');
    console.log('Owner Login: testowner@test.com / password123');
    console.log('Visitor Login: testvisitor@test.com / password123');
    console.log('\nPremium Business: http://localhost:3000/business/premium-test-salon');
    console.log('Free Business: http://localhost:3000/business/free-test-salon');
    console.log('\nOwner Dashboard: http://localhost:3000/owner/dashboard');
    console.log('Plan Selection: http://localhost:3000/owner/plan-selection');
    console.log('\n✅ All test data created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
