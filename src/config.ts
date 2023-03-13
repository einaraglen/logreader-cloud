import dotenv from "dotenv";
import * as path from "path";
import Logger from "./services/output/logger";

const variables: string[] = [
  "DATABASE_URL",
  "MINIO_ENDPOINT",
  "MINIO_BUCKET",
  "MINIO_REGION",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY"
];

const Config = async () => {
  await dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
  });

  const failure = variables.reduce<boolean>(
    (res: boolean, curr: string) => {
      if (!process.env[curr]) {
        Logger.info(`Missing required "${curr}" parameter`);
        return true;
      }
      return res;
    },
    false
  );

  if (failure) {
    process.exit(1);
  } 
};

export default Config;