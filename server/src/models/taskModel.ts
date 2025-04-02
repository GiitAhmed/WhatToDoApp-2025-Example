import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db";
export enum TaskStatusEnum {
  New,
  InProgress,
  Done,
}

// 1) Create a model class that extends Sequelize’s Model
//    and implements the ITaskAttributes interface
export class TaskModel extends Model {
  public taskId!: number;
  public name!: string;
  public content!: string;
  public startDate!: Date | null;
  public endDate!: Date | null;
  public status!: TaskStatusEnum;

  // timestamps (Sequelize populates these automatically if enabled)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 2) Call .init to define columns and options
TaskModel.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: TaskStatusEnum.New, // optionally set a default
      validate: {
        isInEnumRange(value: number) {
          if (!Object.values(TaskStatusEnum).includes(value)) {
            throw new Error(
              `Invalid TaskStatus value: ${value}, type: ${typeof value}`
            );
          }
        },
      },
    },
  },
  {
    sequelize, // pass your Sequelize instance
    tableName: "Tasks",
    timestamps: true, // adds createdAt/updatedAt columns
  }
);

export default TaskModel;
