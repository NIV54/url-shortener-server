import config from "config";
import jwt from "jsonwebtoken";
import { ObjectID } from "mongodb";

interface signedUser {
  id: string;
}

export const withAuth = async (req, res, next) => {
  const secret: string = config.get("jwtSecret");
  const token = req.body.jwt || req.query.jwt || req.cookies.jwt;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
  } else {
    try {
      const user: signedUser = jwt.verify(token, secret) as signedUser;
      const _id = new ObjectID(user.id);
      req.loggedInUser = await req.usersRepository.findOne({ _id });
      next();
    } catch (err) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  }
};
