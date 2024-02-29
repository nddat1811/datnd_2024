import axios from "axios";
import { Request, Response } from "express";
import { User } from "../models";
import { hashPassword } from "../helpers/hashPassword";
import { returnResponse } from "../helpers/response";
import {
  CODE_CREATED_SUCCESS,
  CODE_SUCCESS,
  ERROR_BAD_REQUEST,
  ERROR_CONFLICT,
  ERROR_FORBIDDEN,
  ERROR_INTERNAL_SERVER,
  ERROR_NOT_FOUND,
  ERROR_UNAUTHORIZED,
} from "../helpers/constant";
import * as bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export interface IUser {
  id: string;
  jsonId: number;
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  image: string;
}

// [GET] api from JSONplaceholder and save to DB
const fetchAPIUserDB = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data } = await axios.get(`${process.env.MOCK_API_URL}/users`);
    const users: IUser[] = data;
    await Promise.all(
      users.map(async (user) => {
        const newUser = new User(user);
        newUser.jsonId = user.id;
        newUser.password = await hashPassword("123"); //default 123
        await newUser.save();
      })
    );

    if (!users) {
      res
        .status(ERROR_BAD_REQUEST)
        .send(returnResponse("Users fetched failed", users));
      return;
    }
    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Users fetched successfully", users));
  } catch (error) {
    console.log("err:", error);
    res.status(500).send("Internal Server Error");
  }
};

// [GET] all users
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 }); //get info except password
    if (!users) {
      res.status(ERROR_NOT_FOUND).send(returnResponse("Can't get users", null));
      return;
    }
    res
      .status(CODE_SUCCESS)
      .send(returnResponse("Get all users successfully", users));
  } catch (err) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [GET] user info by id
const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findOne(
      { _id: id, deletedAt: null },
      { password: 0 }
    ); //get info except password
    if (!user) {
      res
        .status(ERROR_NOT_FOUND)
        .send(returnResponse("Can't find user by ID", null));
      return;
    }
    res
      .status(CODE_SUCCESS)
      .send(returnResponse(`Get user info successfully`, user));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send(error);
  }
};

// [GET] current user info
const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.user; 
    if (!userId) {
      res.status(ERROR_UNAUTHORIZED).send("Unauthorized");
      return;
    }
    const data = await User.findById(userId);
    if (!data) {
      res
        .status(ERROR_NOT_FOUND)
        .send(returnResponse("Can't find user by ID", null));
      return;
    }
    res
      .status(CODE_SUCCESS)
      .send(returnResponse(`Get current user info successfully`, data));
  } catch (error) {
    res.status(ERROR_INTERNAL_SERVER).send("Internal Server Error");
  }
};

// [PUT] update user
const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userIdParam = req.params.id;
  const { delete: flag, ...userData } = req.body;
  const userId = req.body.user;

  try {
    const user = await User.findOne({ _id: userIdParam, deletedAt: null });
    if (!user) {
      res
        .status(ERROR_NOT_FOUND)
        .send(returnResponse("Can't find user by ID", null));
      return;
    }
    // update xem lai 
    if(user._id.toString() !== userId) {
      res.status(ERROR_FORBIDDEN).send("This isn't your account");
      return;
    }
    

    if (flag === true) {
      user.deletedAt = new Date(); //if delete --> update flag
    } else {
      Object.assign(user, userData);
    }

    await user.save();

    res
      .status(CODE_SUCCESS)
      .send(returnResponse(`Update user info successfully`, user));
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// [POST] create user
const register = async (req: Request, res: Response): Promise<void> => {
  const { name, username, password, email } = req.body;

  try {
    const isExist = await User.findOne({
      $or: [{ email }, { name }, { username }],
    });

    if (isExist) {
      res
        .status(ERROR_CONFLICT)
        .send(returnResponse("User already exist", null));
      return;
    }

    const newUser = new User({
      jsonId: (await User.countDocuments()) + 1,
      name,
      username,
      email,
      password: await hashPassword(password),
    });


    await newUser.save();
    res
      .status(CODE_CREATED_SUCCESS)
      .send(returnResponse("User created successfully", newUser));
  } catch (error) {
    console.log("e:", error)
    res.status(500).send("Internal Server Error");
  }
};

// [POST]  sign in
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      res
        .status(ERROR_BAD_REQUEST)
        .send(returnResponse("Please input email and password", null));
    }
    const user = await User.findOne({
      email: email,
      deletedAt: null,
    });

    if(!user) {
      res
        .status(ERROR_BAD_REQUEST)
        .send(returnResponse("Email invalid", null));
      return;
    }
    const checkPass = await bcrypt.compare(password, user.password);

    if (!checkPass) {
      res
        .status(ERROR_BAD_REQUEST)
        .send(returnResponse("Password invalid", null));
      return;
    }

    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email ? String(user.email) : "",
      name: user.name ? String(user.name) : "",
    };

    const accessTokenOptions: SignOptions & { algorithm: "HS512" } = {
      expiresIn: "1d",
      algorithm: "HS512",
    };

    let accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET ?? "123",
      accessTokenOptions
    );

    res.status(CODE_SUCCESS).send(
      returnResponse("Login success", {
        id: user.id,
        accessToken,
      })
    );
  } catch (error) {
    res.status(500).send(`Internal Server Error ${error}`);
  }
};

export {
  login,
  register,
  getProfile,
  getUserById,
  getAllUsers,
  fetchAPIUserDB,
  updateUser,
};
