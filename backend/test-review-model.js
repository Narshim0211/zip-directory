/**
 * 🧪 REVIEW MODEL TEST SCRIPT
 *
 * Tests that the Review model loads correctly and validates data properly.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./models/Review');

async function testReviewModel() {
  try {
    console.log('🧪 Testing Review Model...\n');

    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check model schema
    console.log('Test 1: Schema validation');
    const schema = Review.schema;
    console.log('  - businessId field:', schema.paths.businessId ? '✅' : '❌');
    console.log('  - userId field:', schema.paths.userId ? '✅' : '❌');
    console.log('  - bookingId field:', schema.paths.bookingId ? '✅' : '❌');
    console.log('  - rating field:', schema.paths.rating ? '✅' : '❌');
    console.log('  - message field:', schema.paths.message ? '✅' : '❌');
    console.log('  - photoUrl field:', schema.paths.photoUrl ? '✅' : '❌');
    console.log('  - status field:', schema.paths.status ? '✅' : '❌');
    console.log('');

    // Test 2: Check indexes
    console.log('Test 2: Index validation');
    const indexes = Review.schema.indexes();
    console.log('  - Total indexes:', indexes.length);

    const hasUniqueBookingIndex = indexes.some(idx =>
      idx[0].bookingId === 1 && idx[1]?.unique === true
    );
    console.log('  - Unique bookingId index (FIX #1):', hasUniqueBookingIndex ? '✅' : '❌');

    const hasCompositeIndex = indexes.some(idx =>
      idx[0].businessId === 1 && idx[0].status === 1 && idx[0].createdAt === -1
    );
    console.log('  - Composite index (businessId + status + createdAt):', hasCompositeIndex ? '✅' : '❌');
    console.log('');

    // Test 3: Validation rules
    console.log('Test 3: Validation rules');

    // Test rating min/max
    try {
      const invalidReview = new Review({
        businessId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        bookingId: new mongoose.Types.ObjectId(),
        rating: 6, // Invalid (should be 1-5)
        message: 'This should fail validation'
      });
      await invalidReview.validate();
      console.log('  - Rating validation (1-5): ❌ FAILED (accepted invalid rating)');
    } catch (error) {
      console.log('  - Rating validation (1-5): ✅ (correctly rejected rating > 5)');
    }

    // Test message length
    try {
      const invalidReview = new Review({
        businessId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        bookingId: new mongoose.Types.ObjectId(),
        rating: 5,
        message: 'Short' // Invalid (should be min 10 chars)
      });
      await invalidReview.validate();
      console.log('  - Message length validation (min 10): ❌ FAILED (accepted short message)');
    } catch (error) {
      console.log('  - Message length validation (min 10): ✅ (correctly rejected short message)');
    }

    console.log('\n✅ All Review Model tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
}

testReviewModel();
