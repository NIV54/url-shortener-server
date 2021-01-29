import config from "config";
import { Response } from "express";
import jwt from "jsonwebtoken";
import ms from "ms";
import { nanoid } from "nanoid";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { cookieOptions } from "../../common/cookie-options";
import { CodedError } from "../../utils/errors/CodedError";
import { RefreshToken } from "../refresh-token/model";

import { User } from "./model";

@Service()
export class UserService {
  @InjectRepository(RefreshToken)
  private refreshTokenRepository: Repository<RefreshToken>;

  private async getUserByRefreshToken(refreshToken: string) {
    const refreshTokenFromDb = await this.refreshTokenRepository.findOne({
      token: refreshToken
    });
    return refreshTokenFromDb?.user || null;
  }

  private async getRefreshToken(user: User, refreshToken: string) {
    const refreshTokens = await user.refreshTokens;
    return refreshTokens.find(({ token }) => token === refreshToken);
  }

  private isRefreshTokenValid({ created }: RefreshToken) {
    const refreshTokenExpiry = ms(config.get<string>("refreshTokenExpiry"));
    return created.getTime() + refreshTokenExpiry < Date.now();
  }

  getJWTAndSetCookie({ id }: User, res?: Response) {
    const jsonWebToken = jwt.sign({ id }, config.get("jwtSecret"), {
      expiresIn: config.get<string>("jwtExpiry")
    });
    res?.cookie("jwt", jsonWebToken, cookieOptions);
    return jsonWebToken;
  }

  async refreshJsonWebToken(refreshToken: string, res?: Response) {
    const user = await this.getUserByRefreshToken(refreshToken);
    if (!user) {
      throw new CodedError("Refresh token not found", 401);
    }

    const userRefreshToken = (await this.getRefreshToken(user, refreshToken)) as RefreshToken;

    if (userRefreshToken.revoked) {
      throw new CodedError("Refresh token has been revoked", 401);
    }

    if (this.isRefreshTokenValid(userRefreshToken)) {
      throw new CodedError("Refresh token expired", 401);
    }

    const jsonWebToken = this.getJWTAndSetCookie(user, res);

    return { user, jsonWebToken };
  }

  async revokeRefreshToken(user: User, refreshToken: string) {
    const refreshTokenToRevoke = await this.getRefreshToken(user, refreshToken);
    if (refreshTokenToRevoke) {
      await this.refreshTokenRepository.update(refreshTokenToRevoke, {
        revoked: true
      });
    }
  }

  createRefreshToken(user: User) {
    const refreshToken = this.refreshTokenRepository.create({
      token: nanoid(),
      created: new Date(),
      revoked: false,
      user
    });

    return this.refreshTokenRepository.save(refreshToken);
  }
}
