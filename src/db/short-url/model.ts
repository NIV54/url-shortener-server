import { Entity, Column, UpdateDateColumn, ObjectIdColumn } from "typeorm";

@Entity({ name: "ShortURLs" })
export class ShortURL {
  // TODO: change to not be mongo like
  @ObjectIdColumn()
  id: string;

  @Column()
  url: string;

  @Column({ unique: true })
  alias: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
