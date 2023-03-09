import Log from "../../models/Log";
import Signal from "../../models/Signal";
import Value from "../../models/Value";
import CDPParser from "../../parser/parser";
import Logger from "../output/logger";

export type ValueData = {
  signal_id: number;
  x: number;
  y: number;
};

class Writer {
  public static async insert(result_id: number, parser: CDPParser) {
    parser.parse()
    
    Logger.pending("Starting insert...");

      const { min, max } = parser.range();

      const log = await Log.create(
        {
          result_id,
          from: parseInt(min as any),
          to: parseInt(max as any),
        } );

      Logger.info("Inserted Log");

      const signals = await Signal.bulkCreate(this.signals(log, parser.map()));

      Logger.info("Inserted Signals");

      const map = new Map(
        signals.map((signal) => [signal.dataValues.name, signal.dataValues])
      );

      while (parser.stream().next()) {
        const chunks = await parser.stream().read(map);
        await Promise.all(
          chunks.map(async (chunk, index) => {
            await Value.bulkCreate(chunk, {
              ignoreDuplicates: true,
            });
          })
        );
        Logger.info(`Value insert progress: ${(parser.stream().progress() * 100).toFixed(2)}%`)
      }

      parser.stream().close();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      parser.stream().cleanup();

      Logger.info("Inserted Values");
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
