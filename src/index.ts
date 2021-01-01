import "reflect-metadata";

import express from "express";
import helmet from "helmet";
import config from "config";
import cors from "cors";
import { Connection } from "typeorm";
import { Container } from "typedi";
import cookieParser from "cookie-parser";

import { connectToDB } from "./db/initializer";
import { urlRouter } from "./routers/url";
import { ShortURL } from "./db/short-url/model";
import { User } from "./db/user/model";
import { userRouter } from "./routers/user";

const start = async () => {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(cors({ credentials: true, origin: true }));

  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  await connectToDB();

  app.use((req, _res, next) => {
    const connection = Container.get<Connection>("connection");
    req.shortURLsRepository = connection.getRepository(ShortURL);
    req.usersRepository = connection.getRepository(User);
    next();
  });

  app.use("/url", urlRouter);
  app.use("/user", userRouter);

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
