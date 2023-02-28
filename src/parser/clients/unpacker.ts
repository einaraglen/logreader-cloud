import {
  CDPDataStore,
  columns,
  CompactTables,
  getTypeFromString,
  SignalData,
} from "../types";
import Connection from "better-sqlite3";
import Reader from "./reader";


class CDPUnpacker {
  private type: CDPDataStore;
  private map: Map<number, SignalData> = new Map();
  private connection: Connection.Database;
  private columns: CompactTables;

  constructor(file: string, type: CDPDataStore) {
    this.type = type;
    this.columns = columns[type];
    this.connection = new Connection(file, {
      readonly: true,
      fileMustExist: true,
    });

    this.init();
  }

  public setMap(map: Map<number, SignalData>) {
    this.map = map;
  }

  private init() {
    const collection: SignalData[] = this.connection
      .prepare(`SELECT * FROM ${this.columns.map}`)
      .all();

    this.map = new Map(
      collection.map((item) => [item.id!, { ...item, values: new Map() }])
    );
  }

  private parseSplit(map?: Map<number, SignalData>) {
    const statement = this.connection.prepare(
      `SELECT * FROM ${this.columns.values}`
    );

    for (const entry of statement.iterate()) {
      const time = entry.x_axis;
      const buffer: Buffer = entry.y_axis_data;

      const { id, value } = Reader.split(buffer)

      const signal = (map || this.map).get(id);

      if (signal == null) {
        throw new Error(`Signal with ID ${id} not found!`);
      }

      signal.values.set(time, value);
      (map || this.map).set(id, signal);
    }

    this.connection.close();

    return this.map;
  }

  private parseCompact() {
    const statement = this.connection.prepare(
      `SELECT * FROM ${this.columns.values}`
    );

    const temp = new Map<string, SignalData>();

    for (const entry of statement.iterate()) {
      const time = entry.x_axis;
      const buffer: Buffer = entry.y_axis_data;

      const id = Reader.compact(buffer)

      const signal = this.map.get(id);

      if (signal == null) {
        throw new Error(`Signal with ID ${id} not found!`);
      }

      const value = Reader.read(buffer, getTypeFromString(signal.type!), 3);

      const match = temp.get(signal.name) || { ...signal };

      match.values.set(time, value);
      temp.set(signal.name, signal);
    }

    this.connection.close();

    return temp;
  }

  public parse(map?: Map<number, SignalData>) {
    switch (this.type) {
      case CDPDataStore.Compact:
        return this.parseCompact();
      case CDPDataStore.Split:
        return this.parseSplit(map);
      default:
        throw new Error("Unsupported CDPDataStore type for unpacker");
    }
  }

  public range() {
    const collection = this.connection
      .prepare(`SELECT x_axis FROM ${this.columns.values}`)
      .pluck()
      .all()
      .sort();

    return { min: collection.at(0), max: collection.at(-1) };
  }

  public close() {
    this.connection.close();
  }
}

export default CDPUnpacker;
