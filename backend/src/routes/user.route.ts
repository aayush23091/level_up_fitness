import { UserController } from "../controllers/user.controller";
import { AssignedWorkoutPlanController } from "../controllers/assignedWorkoutPlan.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { avatarUploadMiddleware } from "../middlewares/upload.middleware";
import { Router } from "express";

const userRouter = Router();
const userController = new UserController();
const assignedWorkoutPlanController = new AssignedWorkoutPlanController();

userRouter.post(
    "/upload/photo",
    authorizedMiddleware,
    avatarUploadMiddleware,
    userController.uploadPhoto
);

userRouter.get(
    "/workout-plans",
    authorizedMiddleware,
    assignedWorkoutPlanController.getUserWorkoutPlans
);

export default userRouter;
