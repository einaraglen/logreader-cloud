import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

class Log extends Model<InferAttributes<Log>, InferCreationAttributes<Log>> {
  declare id?: number;
  declare result_id: number;
  declare system_id: string
  declare from?: number;
  declare to?: number;
  declare state: string
}

export const initLog = (sequelize: Sequelize) => Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    system_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    result_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    from: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    to: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    state: {
      defaultValue: "COMPLETED",
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "log",
    timestamps: false,
  }
);

export default Log;
