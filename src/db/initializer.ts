import { createConnection, ConnectionOptions } from "typeorm";
import config from "config";
import { Express } from "express";
import { ShortURL } from "./short-url/model";
import { User } from "./user/model";

class DbInitializer {
  private connectionOptions: ConnectionOptions;

  constructor() {
    this.connectionOptions = { ...config.get("db") };
  }

  connect = async () => {
    const connection = await createConnection(this.connectionOptions);
    console.log("Connected to DB");
    return connection;
  };
}

export const connectToDB = async (app: Express) => {
  const dbInitializer = new DbInitializer();
  const connection = await dbInitializer.connect();
  app.use((req, _res, next) => {
    req.db = connection;
    req.shortURLsRepository = connection.getRepository(ShortURL);
    req.usersRepository = connection.getRepository(User);
    next();
  });
};
