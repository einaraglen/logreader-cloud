import EventEmitter from "events";
import { Socket } from "socket.io"
import { LogTransferObject } from "../models/params/log";
import CDPParser from "../parser/parser";
import Downloader from "../services/minio/downloader";
import Logger from "../services/output/logger";
import Writer from "../services/sequelize/writer";
import { Worker } from "worker_threads"

const progress = async (socket: Socket) => {
  try {
    // system context for current socket
    const uuid: string = socket.handshake.query.uuid! as string;

    socket.on("request", async (payload: any) => {

      const data = LogTransferObject.parse(payload);

      const worker = new Worker(`${__dirname}/worker.js`, { workerData: data });

      worker.on("message", (message) => {
        socket.emit("message", message)
      })

      worker.on("error", (e) => {
        Logger.error(e)
        socket.emit("message", "Worker Error")
      })

      worker.on("exit", () => {
        socket.emit("message", "Worker exited")
      })

    })

    socket.on("disconnect", (e) => Logger.info(e));
  } catch (e) {
    Logger.error(`Failure to emit heartbeat`, e)
    socket.disconnect()
  }
};

export default progress;
