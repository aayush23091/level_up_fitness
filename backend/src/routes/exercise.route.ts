import { Router } from "express";
import { ExerciseController } from "../controllers/exercise.controller";
import { authorizedMiddleware, adminMiddleware, adminOrCoachMiddleware } from "../middlewares/authorized.middleware";

const exerciseRouter = Router();
const exerciseController = new ExerciseController();

// Protect all exercise routes with auth check
exerciseRouter.use(authorizedMiddleware);

// View routes (for coach and admin)
exerciseRouter.get("/", adminOrCoachMiddleware, exerciseController.getExercises);
exerciseRouter.get("/:id", adminOrCoachMiddleware, exerciseController.getExerciseById);

// Admin-only routes
exerciseRouter.post("/", adminMiddleware, exerciseController.createExercise);
exerciseRouter.put("/:id", adminMiddleware, exerciseController.updateExercise);
exerciseRouter.delete("/:id", adminMiddleware, exerciseController.deleteExercise);

export default exerciseRouter;
