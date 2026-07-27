import fs from "fs";
import path from "path";
import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";

const AVATAR_DIR = path.join(__dirname, "../../uploads/avatars");
const WORKOUT_COVER_DIR = path.join(__dirname, "../../uploads/workout-covers");
const WORKOUT_THUMBNAIL_DIR = path.join(__dirname, "../../uploads/workout-thumbnails");
const COACH_PROFILE_DIR = path.join(__dirname, "../../uploads/coach-profiles");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

// Avatar upload configuration
const avatarStorage = multer.diskStorage({
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

const avatarUpload = multer({
    storage: avatarStorage,
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

// Workout cover image upload configuration
const workoutCoverStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        fs.mkdirSync(WORKOUT_COVER_DIR, { recursive: true });
        cb(null, WORKOUT_COVER_DIR);
    },
    filename: (req, file, cb) => {
        const userId = (req.user as IUser)._id.toString();
        const ext = MIME_TO_EXT[file.mimetype] ?? path.extname(file.originalname);
        cb(null, `workout-cover-${userId}-${Date.now()}${ext}`);
    },
});

const workoutCoverUpload = multer({
    storage: workoutCoverStorage,
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

// Coach profile image upload configuration
const coachProfileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        fs.mkdirSync(COACH_PROFILE_DIR, { recursive: true });
        cb(null, COACH_PROFILE_DIR);
    },
    filename: (req, file, cb) => {
        const userId = (req.user as IUser)._id.toString();
        const ext = MIME_TO_EXT[file.mimetype] ?? path.extname(file.originalname);
        cb(null, `coach-profile-${userId}-${Date.now()}${ext}`);
    },
});

const coachProfileUpload = multer({
    storage: coachProfileStorage,
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

// Avatar middleware
export const avatarUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    avatarUpload.single("photo")(req, res, (err: unknown) => {
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

// Workout cover image middleware
export const workoutCoverUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    workoutCoverUpload.single("coverImage")(req, res, (err: unknown) => {
        if (err instanceof MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ message: "File too large" });
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({ message: "Unexpected file field" });
            }
            // For other Multer errors (like missing file), just continue
        }
        if (err instanceof Error) {
            if (err.message === "Invalid file type") {
                return res.status(400).json({ message: "Invalid file type" });
            }
            // For other errors, just continue
        }
        // Even if no file, continue to next middleware
        return next();
    });
};

// Workout thumbnail image upload configuration
const workoutThumbnailStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        fs.mkdirSync(WORKOUT_THUMBNAIL_DIR, { recursive: true });
        cb(null, WORKOUT_THUMBNAIL_DIR);
    },
    filename: (req, file, cb) => {
        const userId = (req.user as IUser)._id.toString();
        const ext = MIME_TO_EXT[file.mimetype] ?? path.extname(file.originalname);
        cb(null, `workout-thumbnail-${userId}-${Date.now()}${ext}`);
    },
});

const workoutThumbnailUpload = multer({
    storage: workoutThumbnailStorage,
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

// Workout thumbnail image middleware
export const workoutThumbnailUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    workoutThumbnailUpload.single("thumbnail")(req, res, (err: unknown) => {
        if (err instanceof MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ message: "File too large" });
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({ message: "Unexpected file field" });
            }
            // For other Multer errors (like missing file), just continue
        }
        if (err instanceof Error) {
            if (err.message === "Invalid file type") {
                return res.status(400).json({ message: "Invalid file type" });
            }
            // For other errors, just continue
        }
        // Even if no file, continue to next middleware
        return next();
    });
};

// Coach profile image middleware
export const coachProfileUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    coachProfileUpload.single("profileImage")(req, res, (err: unknown) => {
        if (err instanceof MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ message: "File too large" });
            }
            return res.status(400).json({ message: "No profile image provided" });
        }
        if (err instanceof Error) {
            if (err.message === "Invalid file type") {
                return res.status(400).json({ message: "Invalid file type" });
            }
            return res.status(400).json({ message: "No profile image provided" });
        }
        return next();
    });
};

// Combined upload middleware for profile update (handles both avatar and coach profile)
const combinedUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, file, cb) => {
            const dir = file.fieldname === "profileImage" ? COACH_PROFILE_DIR : AVATAR_DIR;
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const userId = (req.user as IUser)._id.toString();
            const ext = MIME_TO_EXT[file.mimetype] ?? path.extname(file.originalname);
            const prefix = file.fieldname === "profileImage" ? "coach-profile" : "avatar";
            cb(null, `${prefix}-${userId}-${Date.now()}${ext}`);
        },
    }),
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

export const profileUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    combinedUpload.fields([
        { name: "photo", maxCount: 1 },
        { name: "profileImage", maxCount: 1 }
    ])(req, res, (err: unknown) => {
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
