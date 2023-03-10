import Connection from "better-sqlite3";
import Logger from "../services/output/logger";
import CDPBasic from "./clients/basic";
import CDPCompact from "./clients/compact";
import CSVStream from "./clients/csv";
import CDPSplit from "./clients/split";
import { CDPDataStore, CDPInterface, SignalData } from "./types";

class CDPParser implements CDPInterface {
  private client: CDPInterface;
  private csv_stream: CSVStream

  constructor(file: string) {
    this.csv_stream = new CSVStream();
    const type = this.getType(file);

    switch (type) {
      case CDPDataStore.Basic:
        Logger.info("Found Log type BASIC")
        this.client = new CDPBasic(file, this.csv_stream);
        break;
      case CDPDataStore.Compact:
        Logger.info("Found Log type COMPACT")
        this.client = new CDPCompact(file, this.csv_stream);
        break;
      case CDPDataStore.Split:
        Logger.info("Found Log type SPLIT")
        this.client = new CDPSplit(file, this.csv_stream);
        break;
    }
  }

  public parse() {
    Logger.pending("Parsing log...")
    this.client.parse();
    Logger.info("Parse Complete!")
  }

  public range(): { min: number, max: number } {
    return this.client.range();
  }

  public map(): Map<string, SignalData> {
    return this.client.map()
  }

  public stream() {
    return this.csv_stream
  }

  private getType = (file: string) => {
    try {
      const database = new Connection(file, {
        readonly: true,
        fileMustExist: true,
      });

      const tables = database
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .pluck()
        .all();

      database.close();

      if (tables.includes("SQLSignalLogger")) {
        return CDPDataStore.Basic;
      }

      if (tables.includes("KeyValue")) {
        return CDPDataStore.Compact;
      }

      if (tables.includes("ConnectionNodeMap")) {
        return CDPDataStore.Split;
      }

      throw new Error("Unrecognizable Database Format!");
    } catch (e) {
      // Fuckit, lets try Split
      return CDPDataStore.Split;
    }
  };
}

export default CDPParser;
