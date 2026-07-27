import { Router } from "express";
import { CoachController } from "../controllers/coach.controller";
import { CoachEarningController } from "../controllers/coachEarning.controller";
import { WorkoutPlanController } from "../controllers/workoutPlan.controller";
import { AssignedWorkoutPlanController } from "../controllers/assignedWorkoutPlan.controller";
import { authorizedMiddleware, coachMiddleware } from "../middlewares/authorized.middleware";
import { workoutCoverUploadMiddleware } from "../middlewares/upload.middleware";

const coachRouter = Router();
const coachController = new CoachController();
const coachEarningController = new CoachEarningController();
const workoutPlanController = new WorkoutPlanController();
const assignedWorkoutPlanController = new AssignedWorkoutPlanController();

// Protect all routes with auth and coach role checks
coachRouter.use(authorizedMiddleware, coachMiddleware);

coachRouter.get("/athletes", coachController.getAthletes);
coachRouter.get("/dashboard/stats", coachController.getDashboardStats);

// Analytics routes
coachRouter.get("/analytics/overview", coachController.getAnalyticsOverview);
coachRouter.get("/analytics/athletes", coachController.getAnalyticsAthletes);
coachRouter.get("/analytics/plans", coachController.getAnalyticsPlans);

// Earnings routes
coachRouter.get("/earnings", coachEarningController.getEarnings);

// Workout Plan routes
coachRouter.get("/workout-plans", workoutPlanController.getWorkoutPlans);
coachRouter.get("/workout-plans/:id", workoutPlanController.getWorkoutPlanById);
coachRouter.post("/workout-plans", workoutCoverUploadMiddleware, workoutPlanController.createWorkoutPlan);
coachRouter.put("/workout-plans/:id", workoutCoverUploadMiddleware, workoutPlanController.updateWorkoutPlan);
coachRouter.delete("/workout-plans/:id", workoutPlanController.deleteWorkoutPlan);
coachRouter.patch("/workout-plans/:id/publish", workoutPlanController.publishWorkoutPlan);

// Assigned Workout Plan routes
coachRouter.post("/workout-plans/:planId/assign", assignedWorkoutPlanController.assignWorkoutPlan);
coachRouter.get("/assigned-plans", assignedWorkoutPlanController.getCoachAssignedPlans);

export default coachRouter;
