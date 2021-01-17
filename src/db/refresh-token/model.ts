import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/model";

@Entity({ name: "RefreshTokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  token: string;

  @Column()
  created: number;

  @Column()
  revoked: boolean;

  @ManyToOne(type => User, user => user.refreshTokens, { lazy: true })
  user: User;
}
