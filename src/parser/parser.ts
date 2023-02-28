import Connection from "better-sqlite3";
import CDPBasic from "./clients/basic";
import CDPCompact from "./clients/compact";
import CDPSplit from "./clients/split";
import { CDPDataStore, CDPInterface, Signal } from "./types";

class CDPParser {
  private client: CDPInterface;

  constructor(file: string) {
    const type = this.getType(file);

    switch (type) {
      case CDPDataStore.Basic:
        this.client = new CDPBasic(file);
        break;
      case CDPDataStore.Compact:
        this.client = new CDPCompact(file);
        break;
      case CDPDataStore.Split:
        this.client = new CDPSplit(file);
        break;
    }
  }

  public parse(): Map<string, Signal> {
    return this.client.parse();
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
