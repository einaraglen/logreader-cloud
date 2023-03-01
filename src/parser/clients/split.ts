import Connection from "better-sqlite3";
import { CDPDataStore, CDPInterface, SignalData } from "../types";
import path from "path";
import fs from "fs";
import CDPUnpacker from "./unpacker";

class CDPSplit implements CDPInterface {
  private file: string;
  private map?: Map<number, SignalData>;
  private files: Set<string> = new Set();

  constructor(file: string) {
    this.file = file;
    this.init();
  }

  private getConnectionsFromFile() {
    const connection = new Connection(this.file, {
      readonly: true,
      fileMustExist: true,
    });
    const collection = connection
      .prepare(`SELECT * FROM ConnectionNodeMap`)
      .all();

    connection.close();

    this.files = new Set(collection.map((row) => row.connection));

    this.map = new Map(
      collection.map((item) => [item.id, { ...item, values: new Map() }])
    );
  }

  private getConnectionsFromDir() {
    const directory = path.dirname(this.file);
    const files = fs.readdirSync(directory).filter((file) => /\d/.test(file));
    const cleaned = files.map((file) => parseInt(file.replace(/\D/g, "")));
    this.files = new Set(cleaned as any);
  }

  private init() {
    try {
      this.getConnectionsFromFile();
    } catch (e) {
      this.getConnectionsFromDir();
    }
  }

  public parse() {
    const temp = new Map();

    this.files.forEach((index) => {
      const file = path.join(path.dirname(this.file), `SignalLog${index}.db`);
      const unpacker = new CDPUnpacker(file, CDPDataStore.Split);
      const unpacked: any = unpacker.parse(this.map);
      unpacked.forEach((value: any, key: any) => temp.set(value.name, value));
    });

    return temp;
  }

  public range() {
    const ranges: number[] = [];

    this.files.forEach((index) => {
      const file = path.join(path.dirname(this.file), `SignalLog${index}.db`);
      const unpacker = new CDPUnpacker(file, CDPDataStore.Split);
      const { min, max } = unpacker.range();
      
      if (min) {
        ranges.push(min);
      }

      if (max) {
        ranges.push(max);
      }
    });

    const sorted = ranges.sort()

    return {
      min: sorted.at(0),
      max: sorted.at(-1),
    };
  }
}

export default CDPSplit;
