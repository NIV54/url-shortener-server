import config from "config";
import jwt from "jsonwebtoken";

export const withAuth = (req, res, next) => {
  const secret: string = config.get("jwtSecret");
  const token = req.body.token || req.query.token || req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
  } else {
    try {
      const user = jwt.verify(token, secret);
      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  }
};
