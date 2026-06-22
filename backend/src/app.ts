import express, { Application, NextFunction, Request, Response } from "express";
import path from "path";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import cors from "cors";
import morgan from "morgan";

// routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";

const app: Application = express();
const corsOptions = {
    origin: ["*"], // ["http://localhost:3000", "http://example.com"]
    successStatus: 200
}
app.use(cors(corsOptions)); // enable CORS for all routes

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
app.use(morgan("combined")); // log all requests

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// global api handler (at the last)
app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "API not found" });
    }
)
// global error handler (at the last)
app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);
        if (err instanceof HttpException) {
            return ApiResponseHelper.error(
                res, err.message, err.status
            );
        }
        return ApiResponseHelper.error(
            res, err?.message || "Internal Server Error", 500
        );
    }
)

export default app;