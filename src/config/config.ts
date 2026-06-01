import { config } from "dotenv";
import { resolve } from "node:path";
import z from "zod";

export const NODE_ENV = process.env.NODE_ENV;

config({ path: resolve(`./.env.${NODE_ENV}`) });

//env schema
const envSchema = z.object({
  //App
  PORT: z.coerce.number(),
  APPLICATION_NAME: z.string(),

  //DB
  DB_URI: z.string(),
  REDIS_URI: z.string(),

  //security
  ORIGINS: z.string(),
  USER_ACCESS_TOKEN_SECRET_KEY: z.string(),
  USER_REFRESH_TOKEN_SECRET_KEY: z.string(),
  SYSTEM_ACCESS_TOKEN_SECRET_KEY: z.string(),
  SYSTEM_REFRESH_TOKEN_SECRET_KEY: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.coerce.number(),
  REFRESH_TOKEN_EXPIRES_IN: z.coerce.number(),
  TOKEN_ISSUER: z.string(),
  ROUNDS: z.coerce.number(),
  OTP_SALT_ROUND: z.coerce.number(),
  IV_LENGTH: z.coerce.number(),
  ENCRYPTION_SECRET_KEY: z.string().length(32),

  //Email
  CLIENT_ID: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),

  //Links
  FACEBOOK_LINK: z.string(),
  INSTAGRAM_LINK: z.string(),
  TWITTER_LINK: z.string(),

  //AWS
  AWS_BUCKET_NAME: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_EXPIRES_IN: z.coerce.number(),

  //Push
  FIRE_BASE_CONFIG: z.string(),
});
export const env = envSchema.parse(process.env);

//App
export const PORT = env.PORT;
export const APPLICATION_NAME = env.APPLICATION_NAME;

//DB
export const DB_URI = env.DB_URI;
export const REDIS_URI = env.REDIS_URI;

//Security
export const ORIGINS = env.ORIGINS.split(",");
export const USER_ACCESS_TOKEN_SECRET_KEY = env.USER_ACCESS_TOKEN_SECRET_KEY;
export const USER_REFRESH_TOKEN_SECRET_KEY = env.USER_REFRESH_TOKEN_SECRET_KEY;
export const SYSTEM_ACCESS_TOKEN_SECRET_KEY =
  env.SYSTEM_ACCESS_TOKEN_SECRET_KEY;
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY =
  env.SYSTEM_REFRESH_TOKEN_SECRET_KEY;
export const ACCESS_TOKEN_EXPIRES_IN = env.ACCESS_TOKEN_EXPIRES_IN;
export const REFRESH_TOKEN_EXPIRES_IN = env.REFRESH_TOKEN_EXPIRES_IN;
export const TOKEN_ISSUER = env.TOKEN_ISSUER;
export const ROUNDS = env.ROUNDS;
export const OTP_SALT_ROUND = env.OTP_SALT_ROUND;
export const IV_LENGTH = env.IV_LENGTH;
export const ENCRYPTION_SECRET_KEY = Buffer.from(
  env.ENCRYPTION_SECRET_KEY,
  "hex",
);

//Email
export const CLIENT_ID = env.CLIENT_ID;
export const EMAIL_USER = env.EMAIL_USER;
export const EMAIL_PASS = env.EMAIL_PASS;

//AWS
export const AWS_BUCKET_NAME = env.AWS_BUCKET_NAME;
export const AWS_REGION = env.AWS_REGION;
export const AWS_ACCESS_KEY_ID = env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY;
export const AWS_EXPIRES_IN = env.AWS_EXPIRES_IN;

//Links
export const FACEBOOK_LINK = env.FACEBOOK_LINK;
export const INSTAGRAM_LINK = env.INSTAGRAM_LINK;
export const TWITTER_LINK = env.TWITTER_LINK;

//Push
export const FIRE_BASE_CONFIG = env.FIRE_BASE_CONFIG;
