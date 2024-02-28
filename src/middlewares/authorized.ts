import express from "express";
import { ERROR_FORBIDDEN, ERROR_UNAUTHORIZED } from "../helpers/constant";
import { returnResponse } from "../helpers/response";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface RequestWithUser extends Request {
  user: {
    _id: number;
  };
}

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers["authorization"]; //Bearer authorization
  if (!authHeader) {
    return res
      .status(ERROR_UNAUTHORIZED)
      .send(returnResponse("Unauthorized", null));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "123"
    ) as JwtPayload;

    const userId = decoded.sub;

    if (!userId) {
      throw new Error("User ID is not exist");
    }

    //@ts-ignore
    req.userId = decoded.sub;
    next();
  } catch (err) {
    return res
      .status(ERROR_FORBIDDEN)
      .send(returnResponse("Invalid token", null));
  }
};
