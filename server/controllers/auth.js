import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30s" }
  );
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user._id, username: user.username, password: user.password },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  user.refreshToken = refreshToken;
  user.save();
  return refreshToken;
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 30 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, refreshToken, message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const tokenController = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken(user);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
      console.log(accessToken, "Token refreshed");
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) res.status(400).json("Users not found!");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
