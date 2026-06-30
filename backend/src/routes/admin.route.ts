import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const adminRouter = Router();
const adminController = new AdminController();

// Protect all routes within user management with auth and admin role checks
adminRouter.use(authorizedMiddleware, adminMiddleware);

adminRouter.get("/", adminController.getUsers);
adminRouter.get("/:id", adminController.getUserById);
adminRouter.post("/", adminController.createUser);
adminRouter.put("/:id", adminController.updateUser);
adminRouter.delete("/:id", adminController.deleteUser);

export default adminRouter;
