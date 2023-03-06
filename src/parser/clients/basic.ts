import Connection from "better-sqlite3";
import { CDPInterface, SignalData } from "../types";
import CSVStream from "./csv";

class CDPBasic implements CDPInterface {
  private connection: Connection.Database;
  private stream: CSVStream;
  private connections: Map<string, SignalData> = new Map()

  constructor(file: string, stream: CSVStream) {
    this.stream = stream
    this.connection = new Connection(file, {
      readonly: true,
      fileMustExist: true,
    });
  }

  public parse() {
    const statement = this.connection.prepare(`SELECT * FROM SQLSignalLogger`);

    for (const row of statement.iterate()) {
      const time = row.timestamp;
      const map = new Map(Object.entries(row));

      map.delete("id");
      map.delete("timestamp");

      if (this.connections.size == 0) {
        this.connections = new Map(Array.from(map).map(([key, value]) => [key, { name: key }]))
      }

      for (const [key, value] of map) {
        this.stream.write({ name: key, time: parseFloat(time) * 1000, value });
      }
    }
    this.stream.close()
  }

  public range() {
    const collection = this.connection
      .prepare(`SELECT timestamp FROM SQLSignalLogger`)
      .pluck()
      .all()
      .sort();

    return {
      min: parseFloat(collection.at(0)) * 1000,
      max: parseFloat(collection.at(-1)) * 1000,
    };
  }

  public map() {
    return this.connections;
  }
}

export default CDPBasic;
