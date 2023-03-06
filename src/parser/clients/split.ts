import Connection from "better-sqlite3";
import { CDPDataStore, CDPInterface, SignalData } from "../types";
import path from "path";
import fs from "fs";
import CDPUnpacker from "./unpacker";
import CSVStream from "./csv";

class CDPSplit implements CDPInterface {
  private file: string;
  private files: Set<string> = new Set();
  private stream: CSVStream
  private connections: Map<string, SignalData> = new Map();

  constructor(file: string, stream: CSVStream) {
    this.stream = stream;
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
    this.files.forEach((index) => {
      const file = path.join(path.dirname(this.file), `SignalLog${index}.db`);
      const unpacker = new CDPUnpacker(file, CDPDataStore.Split);
      unpacker.parse(this.stream);
      unpacker.map().forEach((value, key) => {
        this.connections.set(key, value)
      })
    });
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

  public map() {
    return this.connections
  }
}

export default CDPSplit;
