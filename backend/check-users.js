require(\"dotenv\").config();
const mongoose = require(\"mongoose\");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model(\"User\", new mongoose.Schema({}, { strict: false }));
  const users = await User.find({ role: \"owner\" }).select(\"email name role\").limit(5);
  console.log(\"\\n Users with role=owner:\", users.length);
  users.forEach((u, i) => console.log(`   ${i+1}. ${u.email} - ${u.name}`));
  
  const allUsers = await User.find().select(\"email role\").limit(10);
  console.log(\"\\n All users (first 10):\");
  allUsers.forEach((u, i) => console.log(`   ${i+1}. ${u.email} - Role: ${u.role}`));
  
  await mongoose.disconnect();
  process.exit(0);
}
check();