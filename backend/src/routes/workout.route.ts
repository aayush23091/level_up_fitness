import { Router } from "express";
import { WorkoutController } from "../controllers/workout.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const workoutRouter = Router();
const workoutController = new WorkoutController();

// Protect all workouts routes with auth check
workoutRouter.use(authorizedMiddleware);

workoutRouter.get("/", workoutController.getWorkouts);
workoutRouter.get("/:id", workoutController.getWorkoutById);

export default workoutRouter;
