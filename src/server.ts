/* eslint no-unmodified-loop-condition: "off" */
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import Log from "./models/Log";
import Signal from "./models/Signal";
import Value from "./models/Value";
import CDPParser from "./parser/parser";
import { Sequelize } from "./services/sequelize/client";
import Writer from "./services/sequelize/writer";

dayjs.extend(duration);
dayjs.extend(relativeTime);

const run = async () => {

  const parser = new CDPParser("./assets/split/SignalLog.db")
  const data = parser.parse()
  const range = parser.range()

  Writer.insert(123, data, range)

  // const test = await Signal.findAll({ where: {
  //   log_id: 17
  // }})

  // console.log(test)

};

export default run;
