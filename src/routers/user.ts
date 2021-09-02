import bcrypt from "bcrypt";
import config from "config";
import { Router } from "express";
import ms from "ms";
import { Container } from "typedi";
import * as yup from "yup";

import { cookieOptions } from "../common/cookie-options";
import { User } from "../db/user/model";
import { UserService } from "../db/user/service";
import { withAuth } from "../middlewares/with-auth";
import { CodedError } from "../utils/errors/CodedError";

export const userRouter = Router();

userRouter.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const schema = yup.object().shape({
      email: yup.string().email().required(),
      username: yup
        .string()
        .trim()
        .matches(/^[^\W_]+$/i)
        .required(),
      password: yup.string().min(6).max(16).required()
    });

    await schema.validate({
      email,
      username,
      password
    });

    if (await req.usersRepository.findOne({ email })) {
      throw new CodedError("Email is already in use", 400);
    }

    if (await req.usersRepository.findOne({ username })) {
      throw new CodedError("Username is already taken", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { password: _, ...created } = await req.usersRepository.save({
      email,
      username,
      password: hashedPassword,
      admin: false,
      refreshTokens: []
    });

    res.status(200).json(created);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const userService = Container.get(UserService);

    if (!usernameOrEmail) {
      throw new CodedError("Username or email are required", 422);
    }

    const user = await req.usersRepository.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) {
      throw new CodedError("User does not exist", 404);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new CodedError("Password incorrect", 401);
    }

    const jsonWebToken = userService.getJWTAndSetCookie(user, res);

    const { token: refreshToken } = await userService.createRefreshToken(user);
    const refreshTokenExpiry = ms(config.get<string>("refreshTokenExpiry"));

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + refreshTokenExpiry)
    });

    res
      .status(200)
      .json({ jwt: jsonWebToken, refreshToken: refreshToken, user: { username: user.username } });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/logout", withAuth, async (req, res, next) => {
  try {
    const refreshToken =
      req.body.refreshToken || req.query.refreshToken || req.cookies.refreshToken;

    if (refreshToken) {
      const userService = Container.get(UserService);
      await userService.revokeRefreshToken(req.loggedInUser as User, refreshToken);
    }
    res.clearCookie("jwt");
    res.clearCookie("refreshToken");
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/jwt", async (req, res, next) => {
  try {
    const refreshToken =
      req.body.refreshToken || req.query.refreshToken || req.cookies.refreshToken;

    const userService = Container.get(UserService);
    const { jsonWebToken } = await userService.refreshJsonWebToken(refreshToken, res);
    res.status(200).json({ jwt: jsonWebToken });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/", withAuth, async (req, res) => {
  const { password, ...user } = req.loggedInUser as User;
  res.json({ user });
});
