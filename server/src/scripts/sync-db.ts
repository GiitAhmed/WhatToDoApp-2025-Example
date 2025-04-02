import { sequelize } from "../config/db";

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced");
  } catch (error) {
    console.error("Sync error:", error);
  } finally {
    process.exit(0);
  }
})();
