/* eslint no-unmodified-loop-condition: "off" */
import Logger from "./services/output/logger";
import express, { Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { route_options, websocket_options } from "./services/cors/options";
import cors from "cors";
import { version } from "../package.json";
import websocket from "./websocket/routes";

const run = () => {
  const PORT = process.env.PORT || 8080;

  const app: Express = express();
  const server = createServer(app);
  const io = new Server(server, websocket_options);

  app.use(express.json());
  app.use(cors(route_options));

  app.get("/", (req, res) => res.send(`logreader-cloud v${version}`));

  server.listen(PORT, () =>
    Logger.info(`logreader-cloud v${version} listening to port: ${PORT}`)
  );

  websocket(io);
};

export default run;
