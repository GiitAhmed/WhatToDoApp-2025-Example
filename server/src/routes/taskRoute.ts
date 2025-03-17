import { Router } from "express";
import { getTasks } from "../controllers/taskController";

const router = Router();

router.get("/tasks", getTasks);

export default router;
