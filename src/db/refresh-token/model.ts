import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "RefreshTokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  token: string;

  @Column()
  created: number;

  @Column()
  revoked: boolean;
}
