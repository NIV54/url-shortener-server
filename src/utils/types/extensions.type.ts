import { Connection, Repository } from "typeorm";
import { ShortURL } from "../../db/short-url/model";
import { User } from "../../db/user/model";

declare global {
  export namespace Express {
    export interface Request {
      db: Connection;
      shortURLsRepository: Repository<ShortURL>;
      usersRepository: Repository<User>;
    }
  }
}
