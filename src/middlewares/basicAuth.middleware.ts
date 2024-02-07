// Custom middleware to authenticate using Basic Auth token
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../entities/User.js";

/**
 * This is the basic auth middleware. Here we try to fetch the user details from the basic auth token provided by the user,
 * then we validate if this user data is present in the database, then we proceed to the subsequent functions
 * @param req any
 * @param res any
 * @param next Function
 * @returns
 */
export const basicAuthMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.path === "/user" && (req.method == "PATCH")) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401);
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");

    try {
      const user = await User.findOneBy({
        email: username,
      });
      if (!user) {
        return res.status(401);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.user = {
          userName: user.email,
        }; // Attach user to request object
        next();
      } else {
        return res.status(401);
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    next();
  }
};
