import express from "express";
import {
  updatePost,
  createPost,
  getPostById,
  getAllPosts,
  fetchAPIPostDB,
} from "../controllers/post.controller";
import { isAuthenticated } from "../middlewares/authorized";

const router = express.Router();

router.get("/fetch", fetchAPIPostDB);
router.get("/list", getAllPosts);
router.get("/detail/:id", getPostById);
router.put("/update/:id", isAuthenticated, updatePost);
router.post("/create", isAuthenticated, createPost);

export default router;
