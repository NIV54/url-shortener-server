import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  httpOnly: false,
  sameSite: "none",
  secure: true
};
