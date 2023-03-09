import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes } from "sequelize";
import Log from "./Log";

class Signal extends Model<InferAttributes<Signal>, InferCreationAttributes<Signal>> {
  declare id?: number;
  declare name: string;
  declare path?: string;
  declare log_id: number
}

export const initSignal = (sequelize: Sequelize) => Signal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
    },
    log_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    }
  },
  {
    sequelize,
    modelName: "signal",
    timestamps: false,
  }
);

export default Signal;
