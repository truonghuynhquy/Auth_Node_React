import express from "express";
import {
  getUser,
  login,
  register,
  tokenController,
} from "../controllers/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/token", tokenController);
userRouter.get("/", [tokenController], getUser);

export default userRouter;
