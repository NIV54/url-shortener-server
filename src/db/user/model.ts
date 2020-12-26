import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity({ name: "Users" })
export class User {
  @ObjectIdColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
