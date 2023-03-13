import { Server } from "socket.io"
import log from "./log";
import stream from "./stream";

const websocket = (io: Server<any>) => {
    io.of("/stream").on("connection", stream);
    io.of("/log").on("connection", log);
};

export default websocket;