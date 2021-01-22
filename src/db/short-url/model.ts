import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Lazy } from "../../utils/types/lazy.type";
import { User } from "../user/model";

@Entity({ name: "ShortURLs" })
export class ShortURL {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  url: string;

  @Column({ unique: true })
  alias: string;

  @UpdateDateColumn()
  lastUpdated: Date;

  @ManyToOne(type => User, user => user.shortUrls, { lazy: true })
  user: Lazy<User>;
}
