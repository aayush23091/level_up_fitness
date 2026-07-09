import { Request, Response, NextFunction } from "express";
import { AdminUserService } from "../services/admin.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";

const adminUserService = new AdminUserService();

export class AdminController {
  // GET /api/v1/admin/users
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;

      const { users, total } = await adminUserService.getUsers(page, limit, search);
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      const sanitizedUsers = users.map((user) => {
        const u = user.toObject ? user.toObject() : user;
        const { password, ...rest } = u;
        return rest;
      });

      return ApiResponseHelper.success(res, sanitizedUsers, "Users fetched successfully", 200, meta as any);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/admin/users/:id
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "User ID is required");
      }

      const user = await adminUserService.getUserById(id);

      const u = user.toObject ? user.toObject() : user;
      const { password, ...sanitizedUser } = u;

      return ApiResponseHelper.success(res, sanitizedUser, "User fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // POST /api/v1/admin/users
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = AdminCreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new HttpException(400, `Validation failed: ${errorMsg}`);
      }

      const newUser = await adminUserService.createUser(parsed.data);

      const u = newUser.toObject ? newUser.toObject() : newUser;
      const { password, ...sanitizedUser } = u;

      return ApiResponseHelper.success(res, sanitizedUser, "User created successfully", 201);
    } catch (err: any) {
      return next(err);
    }
  };

  // PUT /api/v1/admin/users/:id
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "User ID is required");
      }

      const parsed = AdminUpdateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new HttpException(400, `Validation failed: ${errorMsg}`);
      }

      const updatedUser = await adminUserService.updateUser(id, parsed.data);

      const u = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
      const { password, ...sanitizedUser } = u;

      return ApiResponseHelper.success(res, sanitizedUser, "User updated successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // DELETE /api/v1/admin/users/:id
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        throw new HttpException(400, "User ID is required");
      }

      await adminUserService.deleteUser(id);

      return ApiResponseHelper.success(res, null, "User deleted successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };

  // GET /api/v1/admin/dashboard/stats
  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await adminUserService.getDashboardStats();

      // Sanitize users
      const sanitizeUsers = (users: any[]) => users.map(user => {
        const u = user.toObject ? user.toObject() : user;
        const { password, ...rest } = u;
        return rest;
      });

      const sanitizedStats = {
        ...stats,
        recentUsers: sanitizeUsers(stats.recentUsers),
        recentCoaches: sanitizeUsers(stats.recentCoaches)
      };

      return ApiResponseHelper.success(res, sanitizedStats, "Dashboard stats fetched successfully", 200);
    } catch (err: any) {
      return next(err);
    }
  };
}
