import config from "config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectID } from "mongodb";

interface signedUser {
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
      const { id } = jwt.verify(jsonWebToken, secret) as signedUser;
      const _id = new ObjectID(id);
      const user = await req.usersRepository.findOne({ _id } as any); // typeorm does not like _id as key, but it works
      if (user) {
        req.loggedInUser = user;
        next();
      } else {
        res.status(401).json({ message: "User does not exist" });
      }
    } catch (err) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  }
};
