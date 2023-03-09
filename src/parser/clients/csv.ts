import { parse, format, CsvFormatterStream } from "fast-csv";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export type WriteRow = {
  name: string;
  time: any;
  value: any;
};

export type ReadRow = {
    x_axis: number,
    y_axis: number,
    signal_id: number,
  };

class CSVStream {
  private BATCH_SIZE: number = 100000;
  private CHUNK_SIZE: number = 1000;
  private TEMP_DIRECTORY: string = "./temp/batches";
  private WORK_DIRECTORY: string;
  private INDEX: number = 0;
  private WRITE_BATCH: number = 0;
  private READ_BATCH: number = -1;

  private output_stream: CsvFormatterStream<WriteRow, WriteRow>;

  constructor() {
    this.WORK_DIRECTORY = uuidv4();
    this.initDirectory();
    this.output_stream = this.initOutputStream();
  }

  private path(batch: number) {
    return `${this.TEMP_DIRECTORY}/${this.WORK_DIRECTORY}/${batch}.csv`;
  }

  private initOutputStream() {
    const csv_stream = format({ headers: true });
    const write_stream = fs.createWriteStream(this.path(this.WRITE_BATCH));
    csv_stream.pipe(write_stream);
    return csv_stream;
  }

  private initDirectory() {
    fs.mkdirSync(`${this.TEMP_DIRECTORY}/${this.WORK_DIRECTORY}`, {
      recursive: true,
    });
  }

  private connect(line: WriteRow, map: Map<string, any>): ReadRow {
    const { id: signal_id } = map.get(line.name)!;
    const time = parseFloat(line.time);
    const value = parseFloat(line.value);
    return {
      x_axis: time,
      y_axis: value,
      signal_id,
    };
  }

  public write(row: WriteRow) {
    if (this.INDEX % this.BATCH_SIZE == 0) {
      this.output_stream.end();
      this.output_stream = this.initOutputStream();
      this.WRITE_BATCH++;
    }

    this.output_stream.write(row);
    this.INDEX++;
  }

  public read(map: Map<string, any>): Promise<ReadRow[][]> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(this.path(this.READ_BATCH));
      const values: any = [];
      const chunks: ReadRow[][] = [];

      stream
        .pipe(parse({ headers: true }))
        .on("data", (line) => values.push(this.connect(line, map)))
        .on("error", (err) => reject(err))
        .on("end", () => {
          for (let i = 0; i < values.length; i += this.CHUNK_SIZE) {
            const chunk: any = values.slice(i, i + this.CHUNK_SIZE);
            chunks.push(chunk);
          }
          resolve(chunks);
        });
    });
  }

  public progress() {
    return this.READ_BATCH / (this.WRITE_BATCH - 1)
  }

  public next() {
    this.READ_BATCH++;
    return this.READ_BATCH <= this.WRITE_BATCH - 1;
  }

  public close() {
    this.output_stream.end();
  }

  public cleanup() {
    fs.rmSync(`${this.TEMP_DIRECTORY}/${this.WORK_DIRECTORY}`, { recursive: true, force: true });
  }
}

export default CSVStream;
