import fs from "fs/promises";
import MenuJob from "../models/MenuJob.js";
import Restaurant from "../models/Restaurant.js";
import { processMenuJob } from "../services/menuWorker.js";

const cleanupUploadedFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to cleanup upload ${filePath}:`, error.message);
    }
  }
};

export const uploadMenu = async (req, res) => {
  try {
    const restaurant_name = req.body.restaurant_name?.trim();

    if (!restaurant_name) {
      await cleanupUploadedFile(req.file?.path);
      return res.status(400).json({ message: "restaurant_name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "image is required" });
    }

    const job = await MenuJob.create({
      restaurant_name,
      status: "pending",
    });

    processMenuJob(job._id.toString(), req.file.path).catch((error) => {
      console.error(`Unhandled menu job error ${job._id}:`, error.message);
    });

    res.status(201).json({
      success: true,
      jobId: job._id.toString(),
    });
  } catch (error) {
    await cleanupUploadedFile(req.file?.path);
    res.status(500).json({ message: error.message });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const job = await MenuJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const response = {
      jobId: job._id.toString(),
      status: job.status,
      error: job.error || null,
    };

    if (job.status === "completed") {
      const restaurant = await Restaurant.findOne({
        restaurant_name: job.restaurant_name,
      });

      if (restaurant) {
        response.items = restaurant.items;
      }
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
