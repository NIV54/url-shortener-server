import { Router } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import config from "config";
import jwt from "jsonwebtoken";

import { User } from "../db/user/model";

export const userRouter = Router();

userRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // TODO: add validation
    if (await req.usersRepository.findOne({ email })) {
      throw new Error("Email is already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    req.usersRepository.save({ email, password: hashedPassword, admin: false });

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    {
      successRedirect: `${config.get("frontendUrl")}`,
      failureRedirect: `${config.get("frontendUrl")}login`
    },
    (error, user: User, info) => {
      if (error) return res.status(500).send(error);
      if (user) {
        const token = jwt.sign({ id: user.id }, config.get("jwtSecret"));
        return res.send(token);
      }

      res.status(401).send(info.message);
    }
  )(req, res, next);
});
