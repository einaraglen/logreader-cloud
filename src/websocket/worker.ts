import { workerData, parentPort as listener } from "worker_threads";
import Config from "../config";
import { Minio } from "../services/minio/client";
import { Sequelize } from "../services/sequelize/client";
import Writer from "../services/sequelize/writer";

const run = async () => {
  await Config();
  await Sequelize();
  Minio();

  const { result_id, system_id, file } = workerData;

  const writer = new Writer({ listener, result_id, system_id, file })

  await writer.insert();
};

run();
