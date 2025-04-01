import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DBConfig {
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;
  DB_HOST: string;
  DB_PORT: number;
}

const getRequiredEnvVars = (): DBConfig => {
  const requiredEnv = [
    "DB_NAME",
    "DB_USER",
    "DB_PASS",
    "DB_HOST",
    "DB_PORT",
  ] as const;
  requiredEnv.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });

  // Safely extract and parse
  return {
    DB_NAME: process.env.DB_NAME as string,
    DB_USER: process.env.DB_USER as string,
    DB_PASS: process.env.DB_PASS as string,
    DB_HOST: process.env.DB_HOST as string,
    DB_PORT: parseInt(process.env.DB_PORT as string, 10) || 5432,
  };
};

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = getRequiredEnvVars();

// Typical Sequelize configuration
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

let retryCount = 0;

const connectWithRetry = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL is connected via Sequelize");
    retryCount = 0; // reset on successful connection
  } catch (error) {
    retryCount += 1;
    console.error(
      `Sequelize connection unsuccessful, retry after ${
        2 * retryCount
      } seconds.`,
      error
    );
    setTimeout(connectWithRetry, 2000 * retryCount);
  }
};

export { sequelize, connectWithRetry };
