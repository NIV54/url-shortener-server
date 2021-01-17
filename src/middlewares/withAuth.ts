import config from "config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectID } from "mongodb";
import { Container } from "typedi";

import { UserService } from "../db/user/service";

interface SignedUser {
  id: string;
}

export const withAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret: string = config.get("jwtSecret");
  let jsonWebToken = req.body.jwt || req.query.jwt || req.cookies.jwt;

  if (!jsonWebToken) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
  } else {
    try {
      const { id } = jwt.verify(jsonWebToken, secret) as SignedUser;
      const user = await req.usersRepository.findOne({ id });
      if (user) {
        req.loggedInUser = user;
        next();
      } else {
        res.status(401).json({ message: "User does not exist" });
      }
    } catch (error) {
      const refreshToken =
        req.body.refreshToken ||
        req.query.refreshToken ||
        req.cookies.refreshToken;
      if (!refreshToken) {
        res
          .status(401)
          .json({ message: "Unauthorized: Invalid/Expired token" });
      } else {
        try {
          // issue new jwt if a refresh token is provided
          const userService = Container.get(UserService);
          const { user } = await userService.refreshJsonWebToken(
            refreshToken,
            res
          );
          req.loggedInUser = user;
          next();
        } catch (error) {
          next(error);
        }
      }
    }
  }
};
