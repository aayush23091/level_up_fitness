import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";

const userService = new UserService();

function toUploadsUrl(filePath: string): string {
    // Example Windows path:
    // C:\Users\...\backend\uploads\avatars\avatar-123.jpg
    // We want: /uploads/avatars/avatar-123.jpg
    const normalized = filePath.replace(/\\/g, "/");

    const idx = normalized.lastIndexOf("/uploads/");
    if (idx >= 0) {
        return normalized.slice(idx).replace(/\/+$/g, "");
    }

    // Fallback: if it contains uploads without trailing slash
    const idx2 = normalized.lastIndexOf("/uploads");
    if (idx2 >= 0) {
        return normalized.slice(idx2);
    }

    // As a last resort, return filename as /uploads/<filename>
    const filename = normalized.split("/").pop();
    return filename ? `/uploads/${filename}` : "";
}


export class UserController {
    // POST /auth/register
    createUser = async (req: Request, res: Response) => {
        try {
            const payload = req.body as CreateUserDTO;
            if (!payload?.email || !payload?.password || !payload?.username) {
                throw new HttpException(400, "Invalid payload");
            }

            const { user, token } = await userService.createUser(payload);

            return ApiResponseHelper.success(res, { user, token }, "User created", 201);
        } catch (err: any) {
            return ApiResponseHelper.error(res, err.message || "Internal Server Error", err.status || 500);
        }
    };

    // POST /auth/login
    loginUser = async (req: Request, res: Response) => {
        try {
            const payload = req.body as LoginUserDTO;
            if (!payload?.email || !payload?.password) {
                throw new HttpException(400, "Invalid payload");
            }

            const { user, token } = await userService.loginUser(payload);

            return ApiResponseHelper.success(res, { user, token }, "Login successful", 200);
        } catch (err: any) {
            return ApiResponseHelper.error(res, err.message || "Internal Server Error", err.status || 500);
        }
    };

    // GET /auth/whoami
    whoAmI = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                throw new HttpException(401, "Unauthorized");
            }

            return ApiResponseHelper.success(res, req.user as IUser, "User info", 200);
        } catch (err: any) {
            return ApiResponseHelper.error(res, err.message || "Internal Server Error", err.status || 500);
        }
    };

    // PUT /auth/update
    // (avatarUploadMiddleware runs before this)
    updateProfile = async (req: Request, res: Response) => {
        try {
            const user = req.user as IUser | undefined;
            if (!user) {
                throw new HttpException(401, "Unauthorized");
            }

            // multer stores file at req.file and middleware ensures file exists/validity for this route.
            const file = (req as any).file as Express.Multer.File | undefined;
            const profilePhoto = file?.path
                ? toUploadsUrl(file.path)
                : undefined;


            const { name, username, phoneNumber, gender, password } = req.body ?? {};

            const updateData: Partial<IUser> & { password?: string; profilePhoto?: string } = {
                name,
                username,
                phoneNumber,
                gender,
                ...(password ? { password } : {}),
                ...(profilePhoto ? { profilePhoto } : {}),
            };

            const updatedUser = await userService.updateUser(user._id.toString(), updateData);

            return ApiResponseHelper.success(res, updatedUser, "Profile updated", 200);
        } catch (err: any) {
            return ApiResponseHelper.error(res, err.message || "Internal Server Error", err.status || 500);
        }
    };

    // POST /upload/photo
    // (kept for compatibility with /user.route.ts)
    uploadPhoto = async (req: Request, res: Response) => {
        try {
            const user = req.user as IUser | undefined;
            if (!user) {
                throw new HttpException(401, "Unauthorized");
            }

            const file = (req as any).file as Express.Multer.File | undefined;
            if (!file?.path) {
                throw new HttpException(400, "No photo uploaded");
            }

            const profilePhoto = toUploadsUrl(file.path);
            await userService.updateProfilePhoto(user._id.toString(), profilePhoto);

            return ApiResponseHelper.success(res, { profilePhoto }, "Photo uploaded", 200);

        } catch (err: any) {
            return ApiResponseHelper.error(res, err.message || "Internal Server Error", err.status || 500);
        }
    };
}

