import { Sequelize as SequelizeClient } from "sequelize";
import Log, { initLog } from "../../models/Log";
import Signal, { initSignal } from "../../models/Signal";
import Value, { initValue } from "../../models/Value";
import Logger from "../output/logger";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var sequelize: SequelizeClient;
}

const initHypertable = async (sequelize: SequelizeClient) => {
  await sequelize.query("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;", {
    logging: false,
  });
  await sequelize.query(
    "SELECT create_hypertable('values', 'x_axis', if_not_exists => TRUE, chunk_time_interval => 300000);",
    {
      logging: false,
    }
  );
};

const initModels = (sequelize: SequelizeClient) => {
  initLog(sequelize);
  initSignal(sequelize);
  initValue(sequelize);

  Log.hasMany(Signal, {
    foreignKey: "log_id",
    onDelete: "CASCADE",
    hooks: true,
  });
  Signal.belongsTo(Log, { targetKey: "id", foreignKey: "log_id" });

  Signal.hasMany(Value, {
    foreignKey: "signal_id",
    onDelete: "CASCADE",
    hooks: true,
  });
  Value.belongsTo(Signal, { targetKey: "id", foreignKey: "signal_id" });
};

export const Sequelize = async () => {
  const client = new SequelizeClient(process.env.DATABASE_URL!, {
    logging: false,
  });
  try {
    await client.authenticate();
    initModels(client);

    await client.sync({ alter: true, logging: false });
    await initHypertable(client);

    global.sequelize = client;
  } catch (error) {
    Logger.error("Unable to complete database initialization: ", error);
  }
};

export const wipe = async () => {
  Logger.pending("Dropping tables...")
  
  await sequelize.drop()

  Logger.info("Database wipe complete!")
}
