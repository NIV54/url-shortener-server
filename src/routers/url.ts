import { Router } from "express";
import { nanoid } from "nanoid";
import { Container } from "typedi";

import { ShortURLService } from "../db/short-url/service";
import { withAuth } from "../middlewares/with-auth";
import { CodedError } from "../utils/errors/CodedError";

export const urlRouter = Router();

urlRouter.get("/", withAuth, async (req, res) => {
  const urls = await req.shortURLsRepository.find({
    where: {
      user: req.loggedInUser
    },
    order: { lastUpdated: "DESC" }
  });
  res.send(urls);
});

urlRouter.post("/", withAuth, async (req, res, next) => {
  try {
    let { alias, url } = req.body;
    const shortURLService = Container.get(ShortURLService);
    await shortURLService.shortUrlSchema.validate({
      alias,
      url
    });

    alias = (alias || "").toLowerCase();

    if (alias) {
      const existing = await req.shortURLsRepository.findOne({ alias });
      if (existing) {
        throw new CodedError("alias in use", 400);
      }
    } else {
      // creating a new alias until an available one is found
      do {
        alias = nanoid(5).toLowerCase();
      } while (await req.shortURLsRepository.findOne({ alias }));
    }

    const created = await req.shortURLsRepository.insert({
      url,
      alias,
      user: req.loggedInUser
    });

    res.status(200).json({ ...created.raw, url, alias });
  } catch (error) {
    next(error);
  }
});

urlRouter.patch("/", withAuth, async (req, res, next) => {
  try {
    const { url, alias } = req.body;
    const shortURLsService = Container.get(ShortURLService);
    if (!(await shortURLsService.urlBelongsToUser({ alias }, req.loggedInUser))) {
      throw new CodedError("User is not allowed to edit provided url", 401);
    }

    const shortURLService = Container.get(ShortURLService);
    await shortURLService.shortUrlSchema.validate({ url });
    await req.shortURLsRepository.update({ alias }, { url });
    res.json({ url, alias });
  } catch (error) {
    next(error);
  }
});

urlRouter.delete("/:id", withAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const shortURLsService = Container.get(ShortURLService);
    if (!(await shortURLsService.urlBelongsToUser({ id }, req.loggedInUser))) {
      throw new CodedError("User is not allowed to delete provided url", 401);
    }
    await req.shortURLsRepository.delete(id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

urlRouter.use((error, _req, res, next) => {
  error.message =
    error.path === "alias"
      ? "alias can contain only numbers, lowercase letters, dashes and underscores"
      : error.message;
  next(error);
});
