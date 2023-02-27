import { CDPDataStore, CDPDataTypes, getTypeFromString } from "../types";
import Connection from "better-sqlite3";

export type CompactTables = {
  values: string;
  info: string;
  map: string;
};

export type SignalData = {
  id: number;
  name: string;
  path: string;
  type?: string;
};

const columns: Record<string, CompactTables> = {
  compact: {
    info: "KeyValue",
    values: "SignalValues",
    map: "SignalMap",
  },
  split: {
    info: "KeyValue",
    values: "NodeValues",
    map: "Node",
  },
};

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

  private init() {
    const collection: SignalData[] = this.connection
      .prepare(`SELECT * FROM ${this.columns.map}`)
      .all();

    this.map = new Map(collection.map((item) => [item.id, item]));
  }

  private read = (
    buffer: Buffer,
    type: number,
    offset: number = 5,
    length: number = 1
  ) => {
    switch (type) {
      case CDPDataTypes.DOUBLE:
        return buffer.readDoubleLE(offset);
      case CDPDataTypes.UINT64:
        return buffer.readBigUInt64LE(offset);
      case CDPDataTypes.INT64:
        return buffer.readBigInt64LE(offset);
      case CDPDataTypes.FLOAT:
        return buffer.readFloatLE(offset);
      case CDPDataTypes.UINT:
        return buffer.readUIntLE(offset, length);
      case CDPDataTypes.INT:
        return buffer.readIntLE(offset, length);
      case CDPDataTypes.USHORT:
        return buffer.readIntLE(offset, length);
      case CDPDataTypes.SHORT:
        return buffer.readIntLE(offset, length);
      case CDPDataTypes.UCHAR:
        return buffer.readIntLE(offset, length);
      case CDPDataTypes.CHAR:
        return buffer.readIntLE(offset, length);
      case CDPDataTypes.BOOL:
        return buffer.readIntLE(offset, length);
      case CDPDataTypes.STRING:
        return buffer.readIntLE(offset, length);
    }
  };

  private parseSplit() {
    const statement = this.connection.prepare(
      `SELECT * FROM ${this.columns.values}`
    );

    const values: Map<number, { time: number; value: any }[]> = new Map();

    for (const entry of statement.iterate()) {
      const time = entry.x_axis;
      const buffer: Buffer = entry.y_axis_data;

      const id = buffer.readIntLE(2, 2);
      const type = buffer.readIntLE(4, 1);
      const value = this.read(buffer, type, 5);

      const signal = this.map.get(id);

      if (signal == null) {
        throw new Error(`Signal with ID ${id} not found!`);
      }

      if (values.size == 0) {
        console.log(id)
      }

      const collection = values.get(id) || [];
      collection.push({ time, value });
      values.set(id, collection);
    }

    return values
  }

  private parseCompact() {
    const statement = this.connection.prepare(
      `SELECT * FROM ${this.columns.values}`
    );

    const values: Map<number, { time: number; value: any }[]> = new Map();

    for (const entry of statement.iterate()) {
      const time = entry.x_axis;
      const buffer: Buffer = entry.y_axis_data;

      const id = buffer.readIntLE(2, 2);

      const signal = this.map.get(id);

      if (signal == null) {
        throw new Error(`Signal with ID ${id} not found!`);
      }

      const value = this.read(buffer, getTypeFromString(signal.type!), 3);

      const collection = values.get(id) || [];
      collection.push({ time, value });
      values.set(id, collection);
    }

    return values;
  }

  public getMap() {
    return this.map
  }

  public parse() {
    switch (this.type) {
      case CDPDataStore.Compact:
        return this.parseCompact();
      case CDPDataStore.Split:
        return this.parseSplit();
      default:
        throw new Error("Unsupported CDPDataStore type for unpacker");
    }
  }

  public close() {
    this.connection.close();
  }
}

export default CDPUnpacker;