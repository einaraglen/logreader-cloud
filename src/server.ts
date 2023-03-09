/* eslint no-unmodified-loop-condition: "off" */
import CDPParser from "./parser/parser";
import Writer from "./services/sequelize/writer";
import Downloader from "./services/minio/downloader";
import Signal from "./models/Signal";
import { Op, Sequelize } from "sequelize";
import Value from "./models/Value";
import Log from "./models/Log";

const testQuery = async () => {
  console.log("Starting query");

  const start = performance.now();

  const test = await Signal.findAll({
    where: {
      log_id: 2,
    },
    attributes: {
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("values.signal_id")), "size"],
        [Sequelize.fn("MIN", Sequelize.col("values.x_axis")), "from"],
        [Sequelize.fn("MAX", Sequelize.col("values.x_axis")), "to"],
      ],
    },
    include: [
      {
        model: Value,
        attributes: [],
      },
    ],
    group: ["signal.id"],
  });

  const end = performance.now();

  test.forEach((signal) => console.log(signal.dataValues));
  console.log("Used", end - start, "millieseconds to query");
  console.log(test);
};

const run = async () => {
  const downloader = new Downloader(
    "plugin/5bedcb4e-01d2-4180-8a01-fc2f1e06257d.zip"
  );

  const directory = await downloader.download();

  const parser = new CDPParser(`${directory}/SignalLog.db`);

  await Writer.insert(222, parser);

  downloader.cleanup();

  // const log = await Log.create({
  //   result_id: 123,
  //   from: Date.now(),
  //   to: Date.now(),
  // });

  // const commonTime = Date.now();

  // const sig1 = await Signal.create({
  //   log_id: log.dataValues.id!,
  //   name: "Sig1",
  // });

  // const sig2 = await Signal.create({
  //   log_id: log.dataValues.id!,
  //   name: "Sig2",
  // });

  // const val1 = await Value.create({
  //   signal_id: sig1.dataValues.id!,
  //   x_axis: commonTime,
  //   y_axis: 10,
  // });

  // const val2 = await Value.create({
  //   signal_id: sig2.dataValues.id!,
  //   x_axis: commonTime,
  //   y_axis: 10,
  // });
};

export default run;
