import { Router } from "express";
import { CoachHiringController } from "../controllers/coachHiring.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const coachHiringRouter = Router();
const coachHiringController = new CoachHiringController();

// GET /api/v1/coaches - Get all available coaches (public)
coachHiringRouter.get("/coaches", coachHiringController.getAllCoaches);

// GET /api/v1/coaches/:id - Get coach by ID (public)
coachHiringRouter.get("/coaches/:id", coachHiringController.getCoachById);

// POST /api/v1/coaches/:coachId/hire - Hire a coach (authenticated users only)
coachHiringRouter.post("/coaches/:coachId/hire", authorizedMiddleware, coachHiringController.hireCoach);

export default coachHiringRouter;
