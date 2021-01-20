import { Router } from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import * as yup from "yup";
import { Container } from "typedi";

import { withAuth } from "../middlewares/withAuth";
import { User } from "../db/user/model";
import { CodedError } from "../utils/errors/CodedError";
import { UserService } from "../db/user/service";

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
    res.cookie("refreshToken", refreshToken);

    res.status(200).json({ jwt: jsonWebToken, refreshToken: refreshToken });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/logout", withAuth, async (req, res, next) => {
  try {
    const refreshToken =
      req.body.refreshToken ||
      req.query.refreshToken ||
      req.cookies.refreshToken;

    if (refreshToken) {
      const userService = Container.get(UserService);
      await userService.revokeRefreshToken(req.loggedInUser, refreshToken);
    }
    res.clearCookie("jwt");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "You have been successfully logged out" });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/jwt", async (req, res, next) => {
  try {
    const refreshToken =
      req.body.refreshToken ||
      req.query.refreshToken ||
      req.cookies.refreshToken;

    const userService = Container.get(UserService);
    const { jsonWebToken } = await userService.refreshJsonWebToken(
      refreshToken,
      res
    );
    res.status(200).json({ jwt: jsonWebToken });
  } catch (error) {
    next(error);
  }
});
