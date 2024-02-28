import express from "express";
import {
  deleteComment,
  updateComment,
  createComment,
  getCommentById,
  getAllCommentsInPost,
  fetchAPICommentDB,
} from "../controllers/comment.controller";
import { isAuthenticated } from "../middlewares/authorized";

const router = express.Router();

router.get("/fetch", fetchAPICommentDB);
router.get("/list-post/:postId", getAllCommentsInPost);
router.get("/detail/:id", getCommentById);
router.put("/update/:id",isAuthenticated, updateComment);
router.post("/create", isAuthenticated, createComment);
router.delete("/delete/:id",isAuthenticated, deleteComment);
export default router;



