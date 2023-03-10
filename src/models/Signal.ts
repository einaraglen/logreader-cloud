import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes } from "sequelize";
import Log from "./Log";

class Signal extends Model<InferAttributes<Signal>, InferCreationAttributes<Signal>> {
  declare id?: number;
  declare name: string;
  declare path?: string;
  declare size?: number;
  declare from?: number;
  declare to?: number;
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
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    from: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    to: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    log_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "signal",
    timestamps: false,
  }
);

export default Signal;
