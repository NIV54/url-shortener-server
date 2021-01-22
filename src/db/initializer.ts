import config from "config";
import { Container, Service } from "typedi";
import { ConnectionOptions, createConnection } from "typeorm";

import { Initializer } from "../utils/types/initializer.type";

@Service()
export class DbInitializer implements Initializer {
  private connectionOptions: ConnectionOptions;

  constructor() {
    this.connectionOptions = { ...config.get("db") };
  }

  initialize = async () => {
    const connection = await createConnection(this.connectionOptions);
    console.log("Connected to DB");
    Container.set("connection", connection);
  };
}
