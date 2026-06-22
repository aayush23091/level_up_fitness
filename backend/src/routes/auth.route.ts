import { UserController } from "../controllers/user.controller";
import { Router } from "express";

const authRouter = Router();
const userController = new UserController();

authRouter.post("/register", userController.createUser);
authRouter.post("/login", userController.loginUser);

export default authRouter;
