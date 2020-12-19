import { Entity, Column, UpdateDateColumn, ObjectIdColumn } from "typeorm";

@Entity({ name: "ShortURLs" })
export class ShortURL {
  @ObjectIdColumn()
  id: string;

  @Column()
  url: string;

  @Column({ unique: true })
  alias: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
