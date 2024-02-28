import express from "express";
import {
  login,
  register,
  getProfile,
  getUserById,
  getAllUsers,
  fetchAPIUserDB,
  updateUser
} from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/authorized";
const router = express.Router();

router.get("/fetch", fetchAPIUserDB);
router.get("/list", getAllUsers);
router.get("/me", isAuthenticated, getProfile);
router.get("/detail/:id", getUserById);
router.post("/register", register);
router.post("/login", login);
router.put("/update/:id",isAuthenticated, updateUser);

export default router;
