import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity({ name: "Users" })
export class User {
  @ObjectIdColumn()
  id: string;

  @Column()
  admin: boolean;

  @Column()
  refreshToken: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
