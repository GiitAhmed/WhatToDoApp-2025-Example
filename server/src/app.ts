import express, { Request, Response } from "express";
import cors from "cors";
import taskRoute from "./routes/taskRoute";

const app = express();

// Use CORS so that the frontend can make API calls
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend address
    methods: ["GET", "POST"], // Allow only necessary HTTP methods
  })
);

app.use("/api", taskRoute);

export default app;
