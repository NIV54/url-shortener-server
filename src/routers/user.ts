import { Router } from "express";
import bcrypt from "bcrypt";
import config from "config";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import ms from "ms";

import { withAuth } from "../middlewares/withAuth";
import { User } from "../db/user/model";

export const userRouter = Router();

function getJWT({ id }: User, res) {
  const jsonWebToken = jwt.sign({ id }, config.get("jwtSecret"), {
    expiresIn: "15m"
  });
  res.cookie("jwt", jsonWebToken);
  return jsonWebToken;
}

userRouter.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    // TODO: add validation
    // TODO: second password validation

    if (await req.usersRepository.findOne({ email })) {
      throw new Error("Email is already in use");
    }

    if (await req.usersRepository.findOne({ username })) {
      throw new Error("Username is already taken");
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
    const { email, password } = req.body;
    // TODO: validate
    // TODO: add option to log in with username

    const user = await req.usersRepository.findOne({
      email
    });

    if (!user) {
      throw new Error("User does not exist");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Password incorrect");
    }

    const jsonWebToken = getJWT(user, res);

    const refreshToken = nanoid();
    await req.usersRepository.update(
      { id: user.id },
      {
        refreshTokens: [
          ...user.refreshTokens,
          { token: refreshToken, created: Date.now() }
        ]
      }
    );
    res.cookie("refreshToken", refreshToken);

    return res
      .status(200)
      .json({ jwt: jsonWebToken, refreshToken: refreshToken });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/logout", withAuth, (_req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "You have been successfully logged out" });
});

userRouter.post("/jwt", withAuth, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const user = await req.usersRepository.findOne({
      where: {
        "refreshTokens.token": refreshToken
      }
    });
    if (!user) {
      throw new Error("Refresh token not found");
    }

    const refreshTokenCreation = user.refreshTokens.find(
      ({ token }) => token === refreshToken
    )!.created;
    if (
      refreshTokenCreation + ms(config.get<string>("refreshTokenExpiry")) <
      Date.now()
    ) {
      throw new Error("Refresh token expired");
    }

    const jsonWebToken = getJWT(user, res);
    return res.status(200).json({ jwt: jsonWebToken });
  } catch (error) {
    next(error);
  }
});
