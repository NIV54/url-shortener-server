import { createConnection, ConnectionOptions } from "typeorm";
import config from "config";
import { Container } from "typedi";

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

export const connectToDB = async () => {
  const dbInitializer = new DbInitializer();
  const connection = await dbInitializer.connect();

  Container.set("connection", connection);
};
