import { Router } from "express";
import { WorkoutController } from "../controllers/workout.controller";
import { authorizedMiddleware, coachMiddleware } from "../middlewares/authorized.middleware";

const workoutRouter = Router();
const workoutController = new WorkoutController();

// Protect all workouts routes with auth check
workoutRouter.use(authorizedMiddleware);

// Public routes (for all authenticated users)
workoutRouter.get("/", workoutController.getWorkouts);
workoutRouter.get("/:id", workoutController.getWorkoutById);

// Coach-only routes
workoutRouter.post("/", coachMiddleware, workoutController.createWorkout);
workoutRouter.put("/:id", coachMiddleware, workoutController.updateWorkout);
workoutRouter.delete("/:id", coachMiddleware, workoutController.deleteWorkout);

export default workoutRouter;
