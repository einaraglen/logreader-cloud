import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

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
        primaryKey: true,
      },
      y_axis: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      signal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      }
    },
    {
      sequelize,
      modelName: "value",
      timestamps: false,
    }
  );

export default Value;
