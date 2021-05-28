import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import * as yup from "yup";

import { User } from "../user/model";

import { ShortURL } from "./model";

@Service()
export class ShortURLService {
  @InjectRepository(ShortURL)
  private shortURLsRepository: Repository<ShortURL>;

  async urlBelongsToUser(
    urlFields: Partial<Pick<ShortURL, "id" | "alias">>,
    user: User
  ): Promise<boolean> {
    const url = await this.shortURLsRepository.findOne({
      where: {
        ...urlFields,
        user
      }
    });

    return !!url;
  }

  shortUrlSchema = yup.object().shape({
    alias: yup
      .string()
      .trim()
      .matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required()
  });
}
