import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "../user/model";

@Entity({ name: "RefreshTokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @Column({ type: "timestamptz" })
  created: Date;

  // TODO: maybe just delete the token entirely
  @Column()
  revoked: boolean;

  @ManyToOne(type => User, user => user.refreshTokens, { eager: true })
  user: User;
}
