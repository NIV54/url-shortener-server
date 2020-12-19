import "reflect-metadata";

import express from "express";
import helmet from "helmet";

import config from "config";
import cors from "cors";

import { connectToDB } from "./db/initializer";
import { urlRouter } from "./routers/url";

const start = async () => {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(cors());

  await connectToDB(app);

  app.use("/url", urlRouter);

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

  const port = process.env.PORT || config.get("port");

  app.listen(port, () => {
    console.log(`Listening at port ${port}`);
  });
};

start();
