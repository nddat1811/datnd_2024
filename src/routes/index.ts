import express from "express";
import CommentRouter from "./comment.route";
import PostRouter from "./post.route";
import UserRouter from "./user.route";
const router = express.Router();

router.use("/v1/comment", CommentRouter);
router.use("/v1/post", PostRouter);
router.use("/v1/user", UserRouter);

export default router;
