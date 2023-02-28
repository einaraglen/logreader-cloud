import Connection from "better-sqlite3";
import { CDPInterface, SignalData } from "../types";

class CDPBasic implements CDPInterface {
  private connection: Connection.Database;

  constructor(file: string) {
    this.connection = new Connection(file, {
      readonly: true,
      fileMustExist: true,
    });
  }

  public parse() {
    const statement = this.connection.prepare(`SELECT * FROM SQLSignalLogger`);

    const values: Map<any, SignalData> = new Map();

    for (const row of statement.iterate()) {
      const time = row.timestamp;
      const map = new Map(Object.entries(row))

      map.delete("id")
      map.delete("timestamp")

      for (const [key, value] of map) {
        const previous = (values.get(key) || { name: key, values: new Map() })
        previous.values.set(parseFloat(time), parseFloat(value as any))
        values.set(key, previous)
      }
    }

    return values;
  }
}

export default CDPBasic;
