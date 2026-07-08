import { Router } from "express";
import { CoachController } from "../controllers/coach.controller";
import { WorkoutPlanController } from "../controllers/workoutPlan.controller";
import { authorizedMiddleware, coachMiddleware } from "../middlewares/authorized.middleware";

const coachRouter = Router();
const coachController = new CoachController();
const workoutPlanController = new WorkoutPlanController();

// Protect all routes with auth and coach role checks
coachRouter.use(authorizedMiddleware, coachMiddleware);

coachRouter.get("/athletes", coachController.getAthletes);

// Workout Plan routes
coachRouter.get("/workout-plans", workoutPlanController.getWorkoutPlans);
coachRouter.get("/workout-plans/:id", workoutPlanController.getWorkoutPlanById);
coachRouter.post("/workout-plans", workoutPlanController.createWorkoutPlan);
coachRouter.put("/workout-plans/:id", workoutPlanController.updateWorkoutPlan);
coachRouter.delete("/workout-plans/:id", workoutPlanController.deleteWorkoutPlan);

export default coachRouter;
