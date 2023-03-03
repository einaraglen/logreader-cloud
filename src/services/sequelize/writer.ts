import Log from "../../models/Log";
import Signal from "../../models/Signal";
import Value from "../../models/Value";
import { Signal as SignalData } from "../../parser/types";
import Logger from "../output/logger";

export type ValueData = {
  signal_id: number;
  x: number;
  y: number;
};

class Writer {
  private static CHUNK_SIZE: number = 1000;

  public static async insert(
    result_id: number,
    data: Map<string, SignalData>,
    range: { min: number; max: number }
  ) {

    Logger.pending("Starting insert...")

    const log = await Log.create({
      result_id,
      from: new Date(range.min),
      to: new Date(range.max),
    });

    Logger.info("Inserted Log")

    const signals = await Signal.bulkCreate(this.signals(log, data));

    Logger.info("Inserted Signals")

    const map = new Map(
      signals.map((signal) => [signal.dataValues.name, signal.dataValues])
    );

    await Promise.all(
      this.chunks(map, data).map(async (chunk, index) => {
        Value.bulkCreate(chunk);
        Logger.info(`Inserted chunk ${index + 1}!`);
      })
    );

    Logger.info("Inserted Values")

  }

  private static signals(log: Log, data: Map<string, SignalData>): any[] {
    return Array.from(data).map(([key, value]) => {
      const current = { ...value };
      const size = current.values.size;
      const times = Array.from(current.values.keys());
      delete (current as any).id;
      delete (current as any).values;
      delete (current as any).type;

      return {
        ...current,
        size,
        log_id: log.dataValues.id,
        from: times.at(0) || -1,
        to: times.at(-1) || -1,
      } as any;
    });
  }

  private static chunks(map: Map<string, any>, data: Map<string, SignalData>) {
    const chunks: Value[][] = [];

    data.forEach((signal, key) => {
      const { id: signal_id } = map.get(signal.name)!;
      const values = Array.from(signal.values).map(([x, y]) => ({
        x_axis: x,
        y_axis: y,
        signal_id,
      }));

      for (let i = 0; i < values.length; i += this.CHUNK_SIZE) {
        const chunk: any = values.slice(i, i + this.CHUNK_SIZE);
        chunks.push(chunk);
      }
    });

    return chunks;
  }
}

export default Writer;
