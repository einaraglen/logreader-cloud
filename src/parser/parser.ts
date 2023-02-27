import Connection from "better-sqlite3";
import CDPBasic from "./clients/basic";
import CDPSplit from "./clients/split";
import { CDPDataStore } from "./types";

class Parser {

  private client: any
  
  constructor(file: string) {
    const type = this.getType(file)

    switch(type) {
      case CDPDataStore.Basic:
        this.client = new CDPBasic(file)
        break;
      case CDPDataStore.Compact:
        this.client = new CDPBasic(file)
        break;
        case CDPDataStore.Split:
        this.client = new CDPSplit(file)
        break;
    }
  }

  private getType = (file: string) => {
    const database = new Connection(file, {
        readonly: true,
        fileMustExist: true,
      });
    
      const table_names = database.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
      
      database.close()

      if (table_names.includes("SQLSignalLogger")) {
        return CDPDataStore.Basic;
      }

      if (table_names.includes("KeyValue")) {
        return CDPDataStore.Compact;
      }

      if (table_names.includes("ConnectionNodeMap")) {
        return CDPDataStore.Split;
      }

      throw new Error("Unrecognizable Database format")
}
}

export default Parser;