import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Container } from "typedi";

import { SignedUser } from "../../common/types";
import { UserService } from "../../db/user/service";

/**
 * Tries to get the user from jwt or refresh token.
 * if none are present, or are working, calls next anyway (action is allowed for users and for guests)
 */
export const loggedInOrGuest = async (req: Request, res: Response, next: NextFunction) => {
  const secret: string = config.get("jwtSecret");
  let jsonWebToken = req.body.jwt || req.query.jwt || req.cookies.jwt;

  if (jsonWebToken) {
    try {
      const { id } = jwt.verify(jsonWebToken, secret) as SignedUser;
      const user = await req.usersRepository.findOne({ id });
      if (user) {
        req.loggedInUser = user;
      }
    } catch (_error) {
      const refreshToken =
        req.body.refreshToken || req.query.refreshToken || req.cookies.refreshToken;
      if (refreshToken) {
        try {
          // issue new jwt if a refresh token is provided
          const userService = Container.get(UserService);
          const { user } = await userService.refreshJsonWebToken(refreshToken, res);
          req.loggedInUser = user;
        } catch (_error) {}
      }
    }
  }

  next();
};
