import { Socket } from "socket.io";
import Logger from "../services/output/logger";

const stream = async (socket: Socket) => {
  try {
    // system context for current socket
    const uuid: string = socket.handshake.query.uuid! as string;

    socket.on("request", (message: string) => {
      Logger.info("Test");
    });

    socket.on("abort", (message: string) => {
      Logger.info("Test");
    });

    socket.emit("message", JSON.stringify({ test: 123 }));
    socket.on("disconnect", () => Logger.info());
  } catch (e) {
    Logger.error(`Failure to emit heartbeat`, e);
    socket.disconnect();
  }
};

export default stream;
