import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Lazy } from "../../utils/types/lazy.type";
import { RefreshToken } from "../refresh-token/model";
import { ShortURL } from "../short-url/model";

@Entity({ name: "Users" })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  admin: boolean;

  @OneToMany(type => RefreshToken, refreshToken => refreshToken.user, {
    lazy: true,
    cascade: true
  })
  refreshTokens: Lazy<RefreshToken[]>;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(type => ShortURL, shortUrl => shortUrl.user, {
    lazy: true,
    cascade: true,
    onDelete: "CASCADE"
  })
  shortUrls: Lazy<ShortURL[]>;
}
