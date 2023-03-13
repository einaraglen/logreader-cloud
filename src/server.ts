/* eslint no-unmodified-loop-condition: "off" */
import Logger from "./services/output/logger";
import express, { Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { route_options, websocket_options } from "./services/cors/options";
import cors from "cors";
import { version } from "../package.json";
import websocket from "./websocket/routes";
import { wipe } from "./services/sequelize/client";
import Log from "./models/Log";
import Signal from "./models/Signal";
import Value from "./models/Value";
import { Op } from "sequelize";

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

  // Log.findAll().then((res) => console.log(res))
  // Signal.findAll({ where: { log_id: 1 }, raw: true }).then((res) => console.log(res))
  Value.findAll({
    where: {
      signal_id: 106,
      x_axis: {
        [Op.gt]: 1677253502588,
        [Op.lt]: 1677256636088
      }
    },
    raw: true
  }).then((res) => console.log(res))
  // wipe()
};

export default run;
