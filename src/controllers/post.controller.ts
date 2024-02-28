import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { Post, User } from "../models";
import { returnPagingResponse, returnResponse } from "../helpers/response";
import {
  CODE_CREATED_SUCCESS,
  CODE_SUCCESS,
  ERROR_CONFLICT,
  ERROR_FORBIDDEN,
  ERROR_INTERNAL_SERVER,
  ERROR_NOT_FOUND,
} from "../helpers/constant";
import { calcPagination } from "../helpers/paging";
import { RequestWithUser } from "../middlewares/authorized";

// [GET] api from JSONplaceholder and save to DB
const fetchAPIPostDB = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data } = await axios.get(`${process.env.MOCK_API_URL}/posts`);
    const posts = data.map((post: any) => ({
      userId: post.userId,
      jsonId: post.id,
      title: post.title,
      body: post.body,
    }));
    const users = await User.find();

    const promises = posts.map(async (post: any) => {
      const author = users.find((user: any) => user.jsonId === post.userId);
      if (!author) {
        res
          .status(ERROR_NOT_FOUND)
          .send(returnResponse("Can't find user", null));
      }
      const newPost = new Post({
        userId: author._id,
        jsonId: post.jsonId,
        title: post.title,
        body: post.body,
      });
      await newPost.save();
      return newPost;
    });

    const savedPosts = await Promise.all(promises);

    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Posts fetched successfully", savedPosts));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [GET] all post
const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const title = req.query.title as string;

  try {
    const { offset, limit } = calcPagination(page, pageSize);
    let query = {};

    if (title) {
      query = {
        title: { $regex: title, $options: "i" },
        deleteAt: null,
      };
    } else {
      query = { deleteAt: null };
    }

    const total = await Post.countDocuments(query);
    const currentPage = Math.ceil((offset + 1) / limit);

    const posts = await Post.find(query)
      .skip(offset)
      .limit(limit)
      .populate("userId")
      .sort({ createdAt: -1 });
    const currentTotal = posts.length;

    res
      .status(CODE_SUCCESS)
      .send(
        returnPagingResponse(
          "Get Posts successfully",
          total,
          currentTotal,
          currentPage,
          posts
        )
      );
  } catch (error) {
    res.status(500).send(`Internal Server Error ${error}`);
  }
};

// [GET] post by id
const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await Post.findOne({ _id: id, deleteAt: null }).populate(
      "userId"
    );
    if (!post) {
      res
        .status(ERROR_NOT_FOUND)
        .send(returnResponse("Can't get post by ID (POST DELETE)", null));
      return;
    }
    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Get post by ID successfully", post));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [POST] create post
const createPost = async (req: Request, res: Response): Promise<void> => {
  const { title, body } = req.body;
  //@ts-ignore
  const userId = req.userId;

  try {
    if (!userId) {
      res.status(ERROR_FORBIDDEN).send("Please login to create post");
      return;
    }

    const isExist = await Post.findOne({ title, deleteAt: null });
    if (isExist) {
      res
        .status(ERROR_CONFLICT)
        .send(returnResponse("This title already exist", null));
      return;
    }

    const author = await User.findById(userId);
    if (!author) {
      res
        .status(ERROR_NOT_FOUND)
        .send(returnResponse("Can't find user by ID", null));
      return;
    }
    const newPost = new Post({
      jsonId: (await Post.countDocuments()) + 1,
      title: title,
      body,
      userId: author,
    });
    await newPost.save();

    res
      .status(CODE_CREATED_SUCCESS)
      .send(returnResponse("Post created successfully", newPost));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [PUT] update post
const updatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, body, delete: flag } = req.body;
  //@ts-ignore
  const userId = req.userId;

  try {
    if (!userId) {
      res.status(ERROR_FORBIDDEN).send("Please login to update post");
      return;
    }

    const post = await Post.findOne({ _id: id, deleteAt: null });
    if (!post) {
      res
        .status(ERROR_NOT_FOUND)
        .send(returnResponse("Can't find post by ID (POST DELETE)", null));
      return;
    }
    if (userId != post.userId) {
      res.status(ERROR_FORBIDDEN).send("This post isn't yours");
      return;
    }
    if (flag === true) {
      post.deleteAt = new Date(); //if delete --> update flag
    } else {
      const isExistTitle = await Post.findOne({
        title,
        _id: { $ne: id },
        deleteAt: null,
      });
      if (isExistTitle) {
        res
          .status(ERROR_CONFLICT)
          .send(returnResponse("This title already exists", null));
        return;
      }

      Object.assign(post, { title, body });
    }

    await post.save();
    res
      .status(CODE_SUCCESS)
      .json(returnResponse("Post updated successfully", post));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

export { updatePost, createPost, getPostById, getAllPosts, fetchAPIPostDB };
