import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { Connection } from "typeorm";
import { Container } from "typedi";
import { PassportStatic } from "passport";
import { User } from "../../db/user/model";

export const setupPassport = (passport: PassportStatic) => {
  const userRepository = Container.get<Connection>("connection").getRepository(
    User
  );
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const user = await userRepository.findOne({
          email
        });
        if (!user) {
          return done(null, false, {
            message: "User does not exist"
          });
        }

        try {
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return done(null, false, { message: "Password incorrect" });
          }

          return done(null, user);
        } catch (error) {
          throw error;
        }
      }
    )
  );

  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    try {
      const user = userRepository.findOne({ id });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
