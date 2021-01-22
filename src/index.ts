import "reflect-metadata";

import config from "config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Container } from "typedi";
import { Connection, useContainer } from "typeorm";

import { DbInitializer } from "./db/initializer";
import { ShortURL } from "./db/short-url/model";
import { User } from "./db/user/model";
import { urlRouter } from "./routers/url";
import { userRouter } from "./routers/user";

const start = async () => {
  //#region setup
  //#region db
  useContainer(Container);

  const dbInitializer = Container.get(DbInitializer);
  await dbInitializer.initialize();
  //#endregion db

  //#region app
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(cors({ credentials: true, origin: true }));

  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  //#endregion app
  //#endregion setup

  app.use((req, _res, next) => {
    const connection = Container.get<Connection>("connection");
    req.shortURLsRepository = connection.getRepository(ShortURL);
    req.usersRepository = connection.getRepository(User);
    next();
  });

  app.use("/api/url", urlRouter);
  app.use("/api/user", userRouter);

  app.get("/", (_req, res) => {
    res.redirect(config.get("frontendUrl"));
  });

  app.get("/:alias", async (req, res) => {
    const { alias } = req.params;
    const shortURL = await req.shortURLsRepository.findOne({ alias });
    if (shortURL) {
      const subRouteIndex = req.url.indexOf(
        config.get("subRouteSpecialCharacter")
      );
      const subRoute =
        subRouteIndex !== -1 ? req.url.slice(subRouteIndex + 1) : "";
      return res.redirect(`${shortURL.url}/${subRoute}`);
    }

    // redirect to frontend page to create short url with given alias
    return res.redirect(config.get("frontendUrl") + `?alias=${alias}`);
  });

  app.use((error, _req, res, _next) => {
    res.status(error.status || 500).json({ message: error.message });
  });

  const port = process.env.PORT || config.get("port");

  app.listen(port, () => {
    console.log(`Listening at port ${port}`);
  });
};

start();
