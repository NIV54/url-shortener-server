import config from "config";
import { Response } from "express";
import ms from "ms";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import jwt from "jsonwebtoken";

import { User } from "./model";
import { RefreshToken } from "./refresh-token.type";
import { CodedError } from "../../utils/errors/CodedError";

@Service()
export class UserService {
  @InjectRepository(User)
  private repository: Repository<User>;

  getUserByRefreshToken(refreshToken: string) {
    return this.repository.findOne({
      where: {
        "refreshTokens.token": refreshToken
      }
    });
  }

  getRefreshToken(user: User, refreshToken: string) {
    return user.refreshTokens.find(({ token }) => token === refreshToken);
  }

  isRefreshTokenValid({ created }: RefreshToken) {
    const refreshTokenExpiry = ms(config.get<string>("refreshTokenExpiry"));
    return created + refreshTokenExpiry < Date.now();
  }

  getJWTAndSetCookie({ id }: User, res?: Response) {
    const jsonWebToken = jwt.sign({ id }, config.get("jwtSecret"), {
      expiresIn: "15m"
    });
    res?.cookie("jwt", jsonWebToken);
    return jsonWebToken;
  }

  async refreshJsonWebToken(refreshToken: string, res?: Response) {
    const user = await this.getUserByRefreshToken(refreshToken);
    if (!user) {
      throw new CodedError("Refresh token not found", 401);
    }

    const userRefreshToken = this.getRefreshToken(
      user,
      refreshToken
    ) as RefreshToken;

    if (userRefreshToken.revoked) {
      throw new CodedError("Refresh token has been revoked", 401);
    }

    if (this.isRefreshTokenValid(userRefreshToken)) {
      throw new CodedError("Refresh token expired", 401);
    }

    const jsonWebToken = this.getJWTAndSetCookie(user, res);

    return { user, jsonWebToken };
  }
}
