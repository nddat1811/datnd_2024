import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { Comment, Post, User } from "../models";
import {
  CODE_CREATED_SUCCESS,
  CODE_SUCCESS,
  ERROR_BAD_REQUEST,
  ERROR_FORBIDDEN,
  ERROR_INTERNAL_SERVER,
  ERROR_NOT_FOUND,
  ERROR_UNAUTHORIZED,
} from "../helpers/constant";
import { returnPagingResponse, returnResponse } from "../helpers/response";
import { calcPagination } from "../helpers/paging";
import { RequestWithUser } from "../middlewares/authorized";
//interface comment
interface IComment {
  postId: number;
  name: string;
  email: string;
  body: string;
}

// [GET] api from JSONplaceholder and save to DB
const fetchAPICommentDB = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data } = await axios.get(`${process.env.MOCK_API_URL}/comments`);
    const comments: IComment[] = data;

    await Promise.all(
      comments.map(async (comment) => {
        const post = await Post.findOne({
          jsonId: comment.postId,
          deleteAt: null,
        });

        if (!post) {
          res
            .status(ERROR_NOT_FOUND)
            .send(returnResponse("Not found post with id", null));
          return;
        }

        const newComment = new Comment({
          postId: post,
          name: comment.name,
          email: comment.email,
          body: comment.body,
        });
        await newComment.save();
      })
    );

    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Comments fetched successfully", comments));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [GET] all comments in post
const getAllCommentsInPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { postId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  try {
    if (isNaN(parseInt(postId))) {
      res.status(ERROR_BAD_REQUEST).send("Invalid postId");
      return;
    }

    const { offset, limit } = calcPagination(page, pageSize);
    const total = await Comment.countDocuments({ postId });
    const currentPage = Math.ceil((offset + 1) / limit);

    const comments = await Comment.find({ postId })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const currentTotal = comments.length;

    res
      .status(CODE_SUCCESS)
      .send(
        returnPagingResponse(
          "Get all comments in post successfully",
          total,
          currentTotal,
          currentPage,
          comments
        )
      );
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [GET] comment by id
const getCommentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comment = await Comment.findOne({ _id: id });
    if (!comment) {
      res.status(ERROR_BAD_REQUEST).send("Comment not found");
      return;
    }

    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Get comment by ID successfully", comment));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [POST] create comment
const createComment = async (req: Request, res: Response): Promise<void> => {
  const { postId, body } = req.body;
  //@ts-ignore
  const userId = req.userId

  try {
    const userData = await User.findById(userId);

    if (!userId || !userData) {
      res.status(ERROR_UNAUTHORIZED).send("Unauthorized");
      return;
    }

    const newComment = new Comment({
      postId,
      body,
      email: userData.email,
      name: userData.name,
    });

    await newComment.save();
    res
      .status(CODE_CREATED_SUCCESS)
      .send(returnResponse("Comment created successfully", newComment));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [PUT] update comment
const updateComment = async (req: Request, res: Response): Promise<void> => {
  //@ts-ignore
  const userId = req.userId; 
  const { id } = req.params;
  const { body } = req.body;
  

  try {
    const user = await User.findById(userId);

    if (!userId || !user) {
      res.status(ERROR_UNAUTHORIZED).send("Unauthorized");
      return;
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(ERROR_NOT_FOUND).send("Comment not found"); 
      return;
    }

    if (user.email !== comment.email) {
      res.status(ERROR_FORBIDDEN).send("Forbidden update other user's comments");
      return;
    }

    Object.assign(comment, { body });
    await comment.save();
    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Comment updated successfully", comment));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [DEL] delete comment
const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  //@ts-ignore
  const userId = req.userId; 

  try {
    const user = await User.findById(userId);

    if (!userId || !user) {
      res.status(ERROR_UNAUTHORIZED).send("Unauthorized");
      return;
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(ERROR_NOT_FOUND).send("Comment not found");
      return;
    }

    if (user.email !== comment.email) {
      res.status(ERROR_FORBIDDEN).send("Forbidden delete this comment");
      return;
    }
    
    await Comment.deleteOne({ _id: id });
    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Comment deleted successfully", comment));
  } catch (error) {
    console.log(error)
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

export {
  deleteComment,
  updateComment,
  createComment,
  getCommentById,
  getAllCommentsInPost,
  fetchAPICommentDB,
};
