import { Column, Entity, ObjectIdColumn } from "typeorm";
import { RefreshToken } from "./refresh-token.type";

@Entity({ name: "Users" })
export class User {
  // TODO: change to not be mongo like
  @ObjectIdColumn()
  id: string;

  @Column()
  admin: boolean;

  // TODO: add relationship
  @Column()
  refreshTokens: RefreshToken[];

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
