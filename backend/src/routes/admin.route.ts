import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

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

export default adminRouter;
