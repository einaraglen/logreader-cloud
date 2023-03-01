/* eslint no-unmodified-loop-condition: "off" */
import CDPParser from "./parser/parser";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { Prisma } from "./services/prisma/client";

dayjs.extend(duration);
dayjs.extend(relativeTime);

const run = () => {
  Prisma();

  const parser = new CDPParser("./assets/split/SignalLog.db");

  const data = parser.parse();

    // console.log(data.get("MicroGridSTB_StartChargingOut"))

  data.forEach((signal) => {
    console.log(signal.name, signal.values.size)
  })


};

export default run;
