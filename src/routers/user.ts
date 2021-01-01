import { Router } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import config from "config";
import jwt from "jsonwebtoken";

export const userRouter = Router();

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
      admin: false
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

    // TODO: set expiration data
    // TODO: add refresh token

    const token = jwt.sign({ id: user.id }, config.get("jwtSecret"));
    res.cookie("token", token);
    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
});

// TODO: logout
