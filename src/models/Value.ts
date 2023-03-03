import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import Signal from "./Signal";

class Value extends Model<
  InferAttributes<Value>,
  InferCreationAttributes<Value>
> {
  declare x_axis: number;
  declare y_axis: number;
  declare signal_id: number;
}

export const initValue = (sequelize: Sequelize) =>
  Value.init(
    {
      x_axis: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      y_axis: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      signal_id: {
        type: DataTypes.INTEGER,
        onDelete: "CASCADE",
        references: {
          key: "id",
          model: Signal,
        },
      },
    },
    {
      sequelize,
      modelName: "value",
      timestamps: false,
      indexes: [{ unique: true, fields: ["x_axis", "signal_id"] }],
    }
  );

export default Value;
