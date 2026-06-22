import fs from "fs";
import path from "path";
import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";

const AVATAR_DIR = path.join(__dirname, "../../uploads/avatars");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        fs.mkdirSync(AVATAR_DIR, { recursive: true });
        cb(null, AVATAR_DIR);
    },
    filename: (req, file, cb) => {
        const userId = (req.user as IUser)._id.toString();
        const ext = MIME_TO_EXT[file.mimetype] ?? path.extname(file.originalname);
        cb(null, `avatar-${userId}-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    },
});

export const avatarUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    upload.single("photo")(req, res, (err: unknown) => {
        if (err instanceof MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ message: "File too large" });
            }
            return res.status(400).json({ message: "No photo provided" });
        }
        if (err instanceof Error) {
            if (err.message === "Invalid file type") {
                return res.status(400).json({ message: "Invalid file type" });
            }
            return res.status(400).json({ message: "No photo provided" });
        }
        return next();
    });
};
