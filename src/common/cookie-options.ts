import { CookieOptions } from "express";

import { isProduction } from "../utils/is-production";

export const cookieOptions: CookieOptions = {
  httpOnly: false,
  sameSite: isProduction ? "none" : "strict",
  secure: isProduction
};
