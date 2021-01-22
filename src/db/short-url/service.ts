import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

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
}
