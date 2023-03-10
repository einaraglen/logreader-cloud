import fs from "fs";
import { Extract } from "unzipper";
import { v4 as uuidv4 } from "uuid";
import Logger from "../output/logger";

class Downloader {
  private TEMP_DIRECTORY: string = "./temp/downloads";
  private FILE_NAME: string = "logs";
  private file: string;

  private directory?: string;

  constructor(file: string) {
    this.file = file;
  }

  public async download() {
    await this.import(this.file);
    return await this.unzip();
  }

  public cleanup() {
    fs.rmSync(`${this.TEMP_DIRECTORY}/${this.directory!}`, {
      recursive: true,
      force: true,
    });
  }

  private import(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const directory = uuidv4();

      fs.mkdirSync(`${this.TEMP_DIRECTORY}/${directory}`, {
        recursive: true,
      });

      const output = fs.createWriteStream(
        `${this.TEMP_DIRECTORY}/${directory}/${this.FILE_NAME}.zip`
      );

      Logger.pending("Starting download of log archive...");

      minio.getObject(process.env.MINIO_BUCKET!, file, (err, input) => {
        if (err) {
          return reject(err);
        }
        input.on("data", (chunk) => output.write(chunk));
        input.on("end", () => {
          Logger.info("Download complete!");
          output.close();
          this.directory = directory;
          resolve(directory);
        });
      });
    });
  }

  private unzip(): Promise<string> {
    return new Promise((resolve, reject) => {
      const path = `${this.TEMP_DIRECTORY}/${this.directory}/${this.FILE_NAME}`;
      fs.createReadStream(
        `${this.TEMP_DIRECTORY}/${this.directory}/${this.FILE_NAME}.zip`
      )
        .pipe(Extract({ path }))
        .on("error", (err) => reject(err))
        .on("close", () => {
          fs.unlinkSync(
            `${this.TEMP_DIRECTORY}/${this.directory}/${this.FILE_NAME}.zip`
          );
          resolve(path);
        });
    });
  }
}

export default Downloader;
