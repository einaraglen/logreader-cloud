import Log from "../../models/Log";
import Signal from "../../models/Signal";
import Value from "../../models/Value";
import CDPParser from "../../parser/parser";
import Logger from "../output/logger";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relative from "dayjs/plugin/relativeTime";
import { Sequelize } from "sequelize";
import { EventEmitter } from "events";
import Downloader from "../minio/downloader";

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
  listener: any;
  downloader: Downloader;
};

export type WriterProps = {
  listener: any;
  system_id: string;
  result_id: number;
  file: string;
};

class Writer {
  private log?: Log;
  private listener: any;
  private file: string;
  private downloader?: Downloader;
  private parser?: CDPParser;
  private directory?: string;

  constructor({ listener, result_id, system_id, file }: WriterProps) {
    this.file = file;
    this.listener = listener;
    Log.create({
      result_id,
      system_id,
      state: "WAITING",
    }).then((res) => (this.log = res));
  }

  public async insert() {
    try {
      await this.download();

      const { min, max } = this.parse();

      this.listener.postMessage("INSERTING");

      await this.log?.update({ from: parseInt(min as any), to: parseInt(max as any), state: "INSERTING" });

      const signals = await this.insertSignals();

      await this.insertValues(signals);

      await this.aggregate(this.log!.dataValues.id!);

      this.listener.postMessage("COMPLETED");

      await this.log?.update({ state: "COMPLETED" });
    } catch (e) {
      Logger.error("Failed insert", e)
      this.rollback();
    } finally {
      this.cleanup();
    }
  }

  private async rollback() {
    if (this.log != null) {
      await this.log.destroy();
    }
  }

  private cleanup() {
    if (this.parser != null) {
      this.parser.stream().cleanup();
    }

    if (this.downloader != null) {
      this.downloader.cleanup();
    }
  }

  private parse() {
    this.parser = new CDPParser(
      `${this.directory}/SignalLog.db`,
      this.listener
    );
    this.parser.parse();

    return this.parser.range();
  }

  private async download() {
    const downloader = new Downloader(this.file, this.listener);
    this.directory = await downloader.download();
  }

  private async aggregate(log_id: number) {
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

    const promises = signals.map(async (signal) => {
      await signal.update({
        size: parseInt(signal.dataValues.size as any),
        from: parseInt(signal.dataValues.from as any),
        to: parseInt(signal.dataValues.to as any),
      });
    });

    return await Promise.all(promises);
  }

  private async insertValues(signals: Map<string, any>) {
    while (this.parser!.stream().next()) {
      const chunks = await this.parser!.stream().read(signals);
      await Promise.all(
        chunks.map(async (chunk, index) => {
          await Value.bulkCreate(chunk, {
            ignoreDuplicates: true,
          });
        })
      );

      const progress = (this.parser!.stream().progress() * 100).toFixed(2);
      this.log?.update({ state: progress.toString() });
      this.listener.postMessage(progress);
    }

    this.parser!.stream().close();
  }

  private async insertSignals() {
    const signals = await Signal.bulkCreate(
      this.getSignals(this.log!, this.parser!.map())
    );

    return new Map(
      signals.map((signal) => [signal.dataValues.name, signal.dataValues])
    );
  }

  private getSignals(log: Log, data: Map<string, any>) {
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
