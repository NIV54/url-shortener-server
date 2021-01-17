import config from "config";
import { Response } from "express";
import ms from "ms";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

import { User } from "./model";
import { RefreshToken } from "../refresh-token/model";
import { CodedError } from "../../utils/errors/CodedError";

@Service()
export class UserService {
  @InjectRepository(RefreshToken)
  private refreshTokenRepository: Repository<RefreshToken>;

  private async getUserByRefreshToken(refreshToken: string) {
    const refreshTokenFromDb = await this.refreshTokenRepository.findOne({
      token: refreshToken
    });
    return (refreshTokenFromDb && refreshTokenFromDb.user) || null;
  }

  private getRefreshToken(user: User, refreshToken: string) {
    return user.refreshTokens.find(({ token }) => token === refreshToken);
  }

  private isRefreshTokenValid({ created }: RefreshToken) {
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

  async revokeRefreshToken(user: User, refreshToken: string) {
    const refreshTokenToRevoke = this.getRefreshToken(user, refreshToken);
    if (refreshTokenToRevoke) {
      await this.refreshTokenRepository.update(refreshTokenToRevoke, {
        revoked: true
      });
    }
  }

  createRefreshToken(user: User) {
    const refreshToken = this.refreshTokenRepository.create({
      token: nanoid(),
      created: Date.now(),
      revoked: false,
      user
    });

    return this.refreshTokenRepository.save(refreshToken);
  }
}
