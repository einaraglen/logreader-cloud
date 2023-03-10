import Log from "../../models/Log";
import Signal from "../../models/Signal";
import Value from "../../models/Value";
import CDPParser from "../../parser/parser";
import Logger from "../output/logger";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relative from "dayjs/plugin/relativeTime";
import { Sequelize } from "sequelize";

dayjs.extend(duration);
dayjs.extend(relative);

export type ValueData = {
  signal_id: number;
  x: number;
  y: number;
};

export type InsertProps = {
  system_id: string;
  result_id: number;
  parser: CDPParser;
};

class Writer {
  public static async insert({ system_id, result_id, parser }: InsertProps) {
    parser.parse();

    const { min, max } = parser.range();

    const duration = dayjs(min).from(dayjs(max), true);

    Logger.info(`Found Log of duration: ${duration}`);

    Logger.pending("Starting insert...");

    const log = await Log.create({
      result_id,
      system_id,
      from: parseInt(min as any),
      to: parseInt(max as any),
    });

    Logger.info("Inserted Log");

    const signals = await Signal.bulkCreate(this.signals(log, parser.map()));

    Logger.info("Inserted Signals");

    const map = new Map(
      signals.map((signal) => [signal.dataValues.name, signal.dataValues])
    );

    const start = performance.now();

    while (parser.stream().next()) {
      const chunks = await parser.stream().read(map);
      await Promise.all(
        chunks.map(async (chunk, index) => {
          await Value.bulkCreate(chunk, {
            ignoreDuplicates: true,
          });
        })
      );

      Logger.info(
        `Value insert progress: ${(parser.stream().progress() * 100).toFixed(
          2
        )}%`
      );
    }

    const end = performance.now();

    console.log(
      "Used",
      dayjs(start).from(dayjs(end), true),
      "to bulk insert values"
    );

    parser.stream().close();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    parser.stream().cleanup();

    Logger.info("Inserted Values");

    Logger.pending("Aggregating Values...");

    await this.aggregate(log.dataValues.id!);

    Logger.info("Aggregated Values!");
  }

  public static async aggregate(log_id: number) {
    const signals = await Signal.findAll({
      where: {
        log_id,
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

    const promises = signals.map(async(signal) => {
      await signal.update({
        size: parseInt(signal.dataValues.size as any),
        from: parseInt(signal.dataValues.from as any),
        to: parseInt(signal.dataValues.to as any),
      })
    });

    return await Promise.all(promises)
  }

  private static signals(log: Log, data: Map<string, any>) {
    return Array.from(data).map(([key, value]) => {
      const current = { ...value };
      delete (current as any).id;
      delete (current as any).type;

      return {
        ...current,
        log_id: log.dataValues.id!,
      } as any;
    });
  }
}

export default Writer;
