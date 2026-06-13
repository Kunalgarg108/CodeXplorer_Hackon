import express from "express";
import { auth } from "../middleware/auth.js";
import { uploadMenuImage } from "../middleware/upload.js";
import { uploadMenu, getJobStatus } from "../controllers/menuController.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
  uploadMenuImage.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  });
};

router.post("/upload", auth, handleUpload, uploadMenu);
router.get("/job/:id", auth, getJobStatus);

export default router;
