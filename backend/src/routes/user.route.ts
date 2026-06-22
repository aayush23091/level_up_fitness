import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { avatarUploadMiddleware } from "../middlewares/upload.middleware";
import { Router } from "express";

const userRouter = Router();
const userController = new UserController();

userRouter.post(
    "/upload/photo",
    authorizedMiddleware,
    avatarUploadMiddleware,
    userController.uploadPhoto
);

export default userRouter;
