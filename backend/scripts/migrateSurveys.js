/**
 * Legacy Survey Migration Script
 *
 * This script normalizes old survey documents to ensure they have:
 * - Proper option structure with id, label, and votes
 * - visibleToVisitors field
 * - Proper timestamps
 *
 * Run: node scripts/migrateSurveys.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const Survey = require('../models/Survey');

const migrateSurveys = async () => {
  try {
    console.log('🔄 Starting survey migration...');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Use direct MongoDB collection to bypass mongoose schema validation
    const db = mongoose.connection.db;
    const surveysCollection = db.collection('surveys');

    const surveys = await surveysCollection.find({}).toArray();
    console.log(`📊 Found ${surveys.length} surveys to check`);

    let migratedCount = 0;

    for (const survey of surveys) {
      const updates = {};

      // Normalize options
      if (survey.options && Array.isArray(survey.options)) {
        const normalizedOptions = survey.options.map((opt, index) => {
          let id = opt?.id;
          let label = opt?.label;
          let votes = opt?.votes;

          // Generate ID if missing
          if (!id) {
            id = `opt-${index}`;
          }

          // Extract label from various formats
          // Check if label is a stringified object (e.g., "{ text: 'Yes', votes: 0 }")
          if (label && typeof label === 'string' && label.startsWith('{')) {
            // Try to extract the text value from the stringified object
            const textMatch = label.match(/text:\s*'([^']+)'/);
            if (textMatch && textMatch[1]) {
              label = textMatch[1];
            }
          } else if (!label) {
            // Check if opt has a 'text' property (old format)
            if (opt?.text && typeof opt.text === 'string') {
              label = opt.text;
            } else if (typeof opt === 'string') {
              label = opt;
            } else {
              label = String(opt || '');
            }
          }

          // Ensure votes is a number
          if (votes === undefined || typeof votes !== 'number') {
            votes = Number(opt?.votes || 0);
          }

          return { id, label, votes };
        });

        updates.options = normalizedOptions;
      }

      // Normalize voters array (convert old format to simple user IDs)
      if (survey.voters && Array.isArray(survey.voters)) {
        const normalizedVoters = [];
        for (const voter of survey.voters) {
          if (typeof voter === 'object' && voter.user) {
            // Old format: { user: ObjectId, optionIndex: number }
            normalizedVoters.push(voter.user);
          } else if (voter) {
            // Already in new format: just ObjectId
            normalizedVoters.push(voter);
          }
        }
        updates.voters = normalizedVoters;
      }

      // Set visibility default
      if (survey.visibleToVisitors === undefined) {
        updates.visibleToVisitors = true;
      }

      // Ensure ownerId is set (for legacy compatibility)
      if (!survey.ownerId && survey.author) {
        updates.ownerId = survey.author;
      }

      // Set timestamps if missing
      if (!survey.createdAt) {
        updates.createdAt = new Date();
      }
      if (!survey.updatedAt) {
        updates.updatedAt = new Date();
      }

      // Save if there are updates
      if (Object.keys(updates).length > 0) {
        await surveysCollection.updateOne(
          { _id: survey._id },
          { $set: updates }
        );
        migratedCount++;
        console.log(`✨ Migrated survey ${survey._id}: "${survey.question}"`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Total surveys: ${surveys.length}`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Already normalized: ${surveys.length - migratedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateSurveys();
