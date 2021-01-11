import config from "config";
import { Response } from "express";
import ms from "ms";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import jwt from "jsonwebtoken";

import { User } from "./model";
import { RefreshToken } from "./refresh-token.type";

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

  getJWT({ id }: User, res?: Response) {
    const jsonWebToken = jwt.sign({ id }, config.get("jwtSecret"), {
      expiresIn: "15m"
    });
    res?.cookie("jwt", jsonWebToken);
    return jsonWebToken;
  }
}
