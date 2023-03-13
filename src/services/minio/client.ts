import { Client, ClientOptions } from "minio";
import Logger from "../output/logger";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var minio: Client;
}

const options = (): ClientOptions  => ({
  endPoint: process.env.MINIO_ENDPOINT || "",
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
  useSSL: true,
  region: process.env.MINIO_REGION || "",
});

export const Minio = () => {
  try {
    const client = new Client(options());
    global.minio = client;
  } catch (e) {
    Logger.info("Could not connect to Minio..");
  }
};
