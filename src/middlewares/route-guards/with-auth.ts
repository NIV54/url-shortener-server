import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Container } from "typedi";

import { SignedUser } from "../../common/types";
import { UserService } from "../../db/user/service";
import * as errorCodes from "../../utils/errors/error-codes";

/**
 * gets the user from the jwt
 * if jwt expired, get the user from refresh token
 * otherwise acts as a route guard (can't use this route if you're not logged in)
 */
export const withAuth = async (req: Request, res: Response, next: NextFunction) => {
  const secret: string = config.get("jwtSecret");
  const jsonWebToken = req.body.jwt || req.query.jwt || req.cookies.jwt;

  if (!jsonWebToken) {
    res
      .status(401)
      .json({ message: "Unauthorized: No token provided", code: errorCodes.GENERAL_AUTH_ERROR });
  } else {
    try {
      const { id } = jwt.verify(jsonWebToken, secret) as SignedUser;
      const user = await req.usersRepository.findOne({ id });
      if (user) {
        req.loggedInUser = user;
        next();
      } else {
        res
          .status(401)
          .json({ message: "User does not exist", code: errorCodes.GENERAL_AUTH_ERROR });
      }
    } catch (_error) {
      const refreshToken =
        req.body.refreshToken || req.query.refreshToken || req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          message: "Unauthorized: Invalid/Expired token",
          code: errorCodes.GENERAL_AUTH_ERROR
        });
      } else {
        try {
          // issue new jwt if a refresh token is provided
          const userService = Container.get(UserService);
          const { user } = await userService.refreshJsonWebToken(refreshToken, res);
          req.loggedInUser = user;
          next();
        } catch (error) {
          next(error);
        }
      }
    }
  }
};
