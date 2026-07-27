import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import { workoutThumbnailUploadMiddleware } from "../middlewares/upload.middleware";

const adminRouter = Router();
const adminController = new AdminController();

// Protect all admin routes with auth and admin role checks
adminRouter.use(authorizedMiddleware, adminMiddleware);

// Dashboard stats
adminRouter.get("/dashboard/stats", adminController.getDashboardStats);

// User management
adminRouter.get("/users", adminController.getUsers);
adminRouter.get("/users/:id", adminController.getUserById);
adminRouter.post("/users", adminController.createUser);
adminRouter.put("/users/:id", adminController.updateUser);
adminRouter.delete("/users/:id", adminController.deleteUser);

// Coach management
adminRouter.get("/coaches", adminController.getCoaches);
adminRouter.get("/coaches/:id", adminController.getCoachById);
adminRouter.delete("/coaches/:id", adminController.deleteCoach);

// Workout management
adminRouter.get("/workouts", adminController.getWorkouts);
adminRouter.get("/workouts/:id", adminController.getWorkoutById);
adminRouter.post("/workouts", workoutThumbnailUploadMiddleware, adminController.createWorkout);
adminRouter.put("/workouts/:id", workoutThumbnailUploadMiddleware, adminController.updateWorkout);
adminRouter.delete("/workouts/:id", adminController.deleteWorkout);

// Achievement management
adminRouter.get("/achievements", adminController.getAchievements);
adminRouter.get("/achievements/:id", adminController.getAchievementById);
adminRouter.post("/achievements", adminController.createAchievement);
adminRouter.put("/achievements/:id", adminController.updateAchievement);
adminRouter.delete("/achievements/:id", adminController.deleteAchievement);

// Transaction management
adminRouter.get("/transactions", adminController.getTransactions);

export default adminRouter;
