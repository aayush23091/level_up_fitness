import { Router } from "express";
import { CoachController } from "../controllers/coach.controller";
import { authorizedMiddleware, coachMiddleware } from "../middlewares/authorized.middleware";

const coachRouter = Router();
const coachController = new CoachController();

// Protect all routes with auth and coach role checks
coachRouter.use(authorizedMiddleware, coachMiddleware);

coachRouter.get("/athletes", coachController.getAthletes);

export default coachRouter;
