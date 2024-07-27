import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const middlewareToken = async (req, res, next) => {
  try {
    // 1. Getting token and check of it's there
    let accessToken;
    if (req.headers.cookie && req.headers.cookie.startsWith("accessToken")) {
      accessToken = req.headers.cookie.split("=")[1];
    } else if (req.cookies.accessToken) {
      accessToken = req.cookies.accessToken;
    }
    if (!accessToken) return res.status(401).json("You are not logged in!");

    // 2. Verification token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      return res
        .status(401)
        .json("The user belonging to this token does no longer exist");

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token!" });
  }
};
