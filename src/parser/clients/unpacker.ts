import {
  CDPDataStore,
  columns,
  CompactTables,
  getTypeFromString,
  SignalData,
} from "../types";
import Connection from "better-sqlite3";
import Reader from "./reader";
import CSVStream from "./csv";

class CDPUnpacker {
  private type: CDPDataStore;
  private connections: Map<number, SignalData> = new Map();
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

  private init() {
    const collection: SignalData[] = this.connection
      .prepare(`SELECT * FROM ${this.columns.map}`)
      .all();

    this.connections = new Map(collection.map((item) => [item.id!, item]));
  }

  private keyframes(missing: SignalData[]) {
    try {
      const query = this.connection
        .prepare(`SELECT * FROM KeyFrames1 ORDER BY x_axis ASC LIMIT 1`)
        .all()[0];

      const values = new Map(Object.entries(query));

      const time: number = (values.get("x_axis") as any) * 1000;

      return new Map(
        missing.map((entry) => [
          entry.name,
          {
            time,
            value: values.get(`${entry.name}Last`),
          },
        ])
      );
    } catch (e) {
      return new Map();
    }
  }

  private parseSplit(stream: CSVStream) {
    const statement = this.connection.prepare(
      `SELECT * FROM ${this.columns.values}`
    );

    let missing = Array.from(this.connections).map(([key, value]) => value);

    for (const entry of statement.iterate()) {
      const time = entry.x_axis * 1000;
      const buffer: Buffer = entry.y_axis_data;

      const { id, value } = Reader.split(buffer);

      const signal = this.connections.get(id);

      if (signal == null) {
        throw new Error(`Signal with ID ${id} not found!`);
      }

      missing = missing.filter((item) => item.name !== signal.name);

      stream.write({ name: signal.name, time, value });
    }

    this.keyframes(missing).forEach(({ time, value }: any, key: any) =>
      stream.write({ name: key, time, value })
    );

    this.connection.close();
  }

  private parseCompact(stream: CSVStream) {
    const statement = this.connection.prepare(
      `SELECT * FROM ${this.columns.values}`
    );

    let missing = Array.from(this.connections).map(([key, value]) => value);

    const temp = new Map<string, SignalData>();

    for (const entry of statement.iterate()) {
      const time = entry.x_axis * 1000;
      const buffer: Buffer = entry.y_axis_data;

      const id = Reader.compact(buffer);

      const signal = this.connections.get(id);

      if (signal == null) {
        throw new Error(`Signal with ID ${id} not found!`);
      }

      missing = missing.filter((item) => item.name !== signal.name);

      const value = Reader.read(buffer, getTypeFromString(signal.type!), 3);

      stream.write({ name: signal.name, time, value });
    }

    this.keyframes(missing).forEach(({ time, value }: any, key: any) =>
      stream.write({ name: key, time, value })
    );

    this.connection.close();
  }

  public parse(stream: CSVStream) {
    switch (this.type) {
      case CDPDataStore.Compact:
        this.parseCompact(stream);
        break;
      case CDPDataStore.Split:
        this.parseSplit(stream);
        break;
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

    return { min: collection.at(0) * 1000, max: collection.at(-1) * 1000 };
  }

  public map() {
    return new Map(
      Array.from(this.connections).map(([key, value]) => [value.name, value])
    );
  }

  public close() {
    this.connection.close();
  }
}

export default CDPUnpacker;
