import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { avatarUploadMiddleware } from "../middlewares/upload.middleware";

const authRouter = Router();
const userController = new UserController();

authRouter.post("/register", userController.createUser);
authRouter.post("/login", userController.loginUser);
authRouter.get("/whoami", authorizedMiddleware, userController.whoAmI);
authRouter.put("/update", authorizedMiddleware, avatarUploadMiddleware, userController.updateProfile);

export default authRouter;
