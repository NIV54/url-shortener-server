import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RefreshToken } from "../refresh-token/model";

@Entity({ name: "Users" })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  admin: boolean;

  @OneToMany(type => RefreshToken, refreshToken => refreshToken.user, {
    eager: true,
    cascade: true
  })
  refreshTokens: RefreshToken[];

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
