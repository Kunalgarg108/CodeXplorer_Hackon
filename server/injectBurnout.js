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
      console.log("No users found in database. Please register an account first!");
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s). Injecting 3-day high-stress check-in data...`);

    const now = new Date();
    const mockCheckins = [
      {
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        sleepHours: 4.5,
        eatingPattern: "Skipped meals",
        stressLevel: 5
      },
      {
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        sleepHours: 5.0,
        eatingPattern: "Binged",
        stressLevel: 4
      },
      {
        date: now, // Today
        sleepHours: 4.0,
        eatingPattern: "Ate out",
        stressLevel: 5
      }
    ];

    for (const user of users) {
      if (!user.wellnessProfile) {
        user.wellnessProfile = {};
      }
      user.wellnessProfile.surveyCompleted = true;
      user.wellnessProfile.dailyCheckins = mockCheckins;
      
      // Also set study hours and job for a more realistic analysis score
      user.wellnessProfile.studyHours = 9;
      user.wellnessProfile.hasJob = true;

      await user.save();
      console.log(`Updated user: ${user.name} (${user.email})`);
    }

    console.log("\nInjection complete! 3-day consecutive stress check-in data has been written.");
    console.log("Go to your PocketBuddy dashboard and refresh the page to see the Red warning banner and test the Breathing Spacer.");
    
  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main();
