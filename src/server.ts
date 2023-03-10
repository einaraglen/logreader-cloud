/* eslint no-unmodified-loop-condition: "off" */
import CDPParser from "./parser/parser";
import Writer from "./services/sequelize/writer";
import Downloader from "./services/minio/downloader";
import Signal from "./models/Signal";
import { Op, Sequelize } from "sequelize";
import Value from "./models/Value";
import Log from "./models/Log";
import { v4 as uuidv4 } from "uuid";
import fs from "fs"
import PathBuilder from "./services/path/builder";

const run = async () => {
  // const downloader = new Downloader(
  //   "plugin/fbfb4cbf-74ed-4007-8322-20b9475cfbc8.zip"
  // );

  // const directory = await downloader.download();

  // const parser = new CDPParser(`${directory}/SignalLog.db`);

  // await Writer.insert({ system_id: uuidv4(), result_id: 123, parser });

  // downloader.cleanup();

  console.log("Starting query");

  const start = performance.now();

  const signals = await Signal.findAll({
    where: {
      log_id: 1
    },
  });

  const struct = PathBuilder.build(signals)

  const end = performance.now();

  console.log("Used", end - start, "millieseconds to query signals + build path");


};

export default run;
