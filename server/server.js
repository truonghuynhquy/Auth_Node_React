import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "./database/dbConnection.js";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config({ path: "./config.env" });

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);

dbConnection();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
