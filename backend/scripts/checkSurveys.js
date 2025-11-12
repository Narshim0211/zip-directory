require('dotenv').config();
const mongoose = require('mongoose');

const checkSurveys = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const surveysCollection = db.collection('surveys');

    const surveys = await surveysCollection.find({}).toArray();

    console.log(`Found ${surveys.length} surveys:\n`);

    surveys.forEach((survey, index) => {
      console.log(`\n━━━ Survey ${index + 1} ━━━`);
      console.log(`ID: ${survey._id}`);
      console.log(`Question: ${survey.question}`);
      console.log(`Options:`);
      console.log(JSON.stringify(survey.options, null, 2));
      console.log(`Voters: ${survey.voters ? survey.voters.length : 0}`);
      console.log(`visibleToVisitors: ${survey.visibleToVisitors}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkSurveys();
