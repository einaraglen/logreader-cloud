import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

class Log extends Model<InferAttributes<Log>, InferCreationAttributes<Log>> {
  declare id?: number;
  declare result_id: number;
  declare from: Date;
  declare to: Date;
}

export const initLog = (sequelize: Sequelize) => Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    result_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    from: {
      type: DataTypes.DATE,
      allowNull: false
    },
    to: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "log",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ unique: true, fields: ['id'] }]
  }
);

export default Log;
