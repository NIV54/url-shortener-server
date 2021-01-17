import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Lazy } from "../../utils/types/lazy.type";
import { RefreshToken } from "../refresh-token/model";

@Entity({ name: "Users" })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  admin: boolean;

  @OneToMany(type => RefreshToken, refreshToken => refreshToken.user, {
    // TODO: this needs to be eager (loaded anyway for withAuth middleware), but eager does not work well
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
}
