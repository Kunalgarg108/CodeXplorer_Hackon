import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finan-smart";

async function main() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    const users = await User.find({});
    if (users.length === 0) {
      console.log("No users found in database.");
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s). Clearing daily check-ins...`);

    for (const user of users) {
      if (user.wellnessProfile) {
        user.wellnessProfile.dailyCheckins = [];
        // Optional: you can reset surveyCompleted to false if you want to test onboarding again
        // user.wellnessProfile.surveyCompleted = false;
        await user.save();
        console.log(`Cleared check-ins for: ${user.name} (${user.email})`);
      }
    }

    console.log("\nCleanup complete! All daily check-in logs have been cleared.");
    
  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main();
