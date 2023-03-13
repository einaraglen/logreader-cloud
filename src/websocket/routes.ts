import { Server } from "socket.io"
import progress from "./progress";
import stream from "./stream";

const websocket = (io: Server<any>) => {
    io.of("/stream").on("connection", stream);
    io.of("/progress").on("connection", progress);
};

export default websocket;