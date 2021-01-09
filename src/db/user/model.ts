import { Column, Entity, ObjectIdColumn } from "typeorm";
import { RefreshToken } from "./refresh-token.type";

@Entity({ name: "Users" })
export class User {
  @ObjectIdColumn()
  id: string;

  @Column()
  admin: boolean;

  @Column()
  refreshTokens: RefreshToken[];

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
