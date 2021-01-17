import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from "typeorm";

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
}
