import { Router } from "express";
import { nanoid } from "nanoid";
import * as yup from "yup";

import { CodedError } from "../utils/errors/CodedError";

export const urlRouter = Router();

const schema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required()
});

urlRouter.get("/", async (req, res) => {
  const urls = await req.shortURLsRepository.find({
    order: { lastUpdated: "DESC" }
  });
  res.send(urls);
});

urlRouter.post("/", async (req, res, next) => {
  try {
    let { alias, url } = req.body;
    await schema.validate({
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

    const created = await req.shortURLsRepository.save({
      url,
      alias
    });

    res.status(200).json(created);
  } catch (error) {
    next(error);
  }
});

urlRouter.patch("/", async (req, res, next) => {
  try {
    const { url, alias } = req.body;
    await schema.validate({ url });
    await req.shortURLsRepository.update({ alias }, { url });
    res.json({ url, alias });
  } catch (error) {
    next(error);
  }
});

urlRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
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
