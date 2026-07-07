import { Request, Response, NextFunction } from 'express';
import { SECRET_KEY } from '../configs/constant';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';
import { UserMongoRepository } from '../repositories/user.repository';
import { HttpException } from '../exceptions/http-exception';
import { ApiResponseHelper } from '../utils/apihelper.util';

declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser
        }
    }
} // adding tag (user) to request, can use req.user
let userRepository = new UserMongoRepository();
export const authorizedMiddleware =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer '))
                throw new HttpException(401, 'Unauthorized');
            const token = authHeader.split(' ')[1];
            if (!token) throw new HttpException(401, 'Unauthorized');
            const decodedToken = jwt.verify(token, SECRET_KEY) as Record<string, any>;
            const userId = decodedToken?.userId ?? decodedToken?.id;
            if (!userId) {
                throw new HttpException(401, 'Unauthorized');
            }
            const user = await userRepository.getUserById(String(userId));
            if (!user) throw new HttpException(401, 'Unauthorized');
            req.user = user;
            return next();
        } catch (err: Error | any) {
            const status = err.status || (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ? 401 : 500);
            const message = status === 401 ? 'Unauthorized' : (err.message || 'Internal Server Error');
            return ApiResponseHelper.error(res, message, status);
        }
    }

export const adminMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'admin') {
            throw new HttpException(403, 'Forbidden not admin');
        }
        return next();
    } catch (err: Error | any) {
        return ApiResponseHelper.error(
            res,
            err.message || 'Internal Server Error',
            err.status || 500
        );
    }
}

export const coachMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'coach') {
            throw new HttpException(403, 'Forbidden not coach');
        }
        return next();
    } catch (err: Error | any) {
        return ApiResponseHelper.error(
            res,
            err.message || 'Internal Server Error',
            err.status || 500
        );
    }
}

export const adminOrCoachMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'admin' && req.user.role !== 'coach') {
            throw new HttpException(403, 'Forbidden not admin or coach');
        }
        return next();
    } catch (err: Error | any) {
        return ApiResponseHelper.error(
            res,
            err.message || 'Internal Server Error',
            err.status || 500
        );
    }
}