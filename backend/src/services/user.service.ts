import { UserMongoRepository } from "../repositories/user.repository";
import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { UserAchievementRepository } from "../repositories/userAchievement.repository";
import { AchievementRepository } from "../repositories/achievement.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();
const workoutCompletionRepository = new WorkoutCompletionRepository();
const userAchievementRepository = new UserAchievementRepository();
const achievementRepository = new AchievementRepository();

const getStrippedDate = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

interface StreakResponse {
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: Date | undefined;
    streakActive: boolean;
}

export class UserService {
    async createUser(userData: CreateUserDTO): Promise<{ user: IUser; token: string }> {
        // validation
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        
        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }
        
        // hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await userRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: userData.role ?? "user",
        });
        
        // generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        
        return { user, token };
    }

    async loginUser(loginData: LoginUserDTO): Promise<{ user: IUser; token: string }> {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
        }
        const isPasswordValid = await bcrypt.compare(
            loginData.password,  // client password
            user.password // database password
        );
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid password");
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role }, // payload
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        return { user, token };
    }

    async updateProfilePhoto(userId: string, profilePhoto: string): Promise<void> {
        const updated = await userRepository.update(userId, { profilePhoto });
        if (!updated) {
            throw new HttpException(500, "Avatar upload failed");
        }
    }

    async updateUser(userId: string, updateData: Partial<IUser> & { password?: string }): Promise<IUser> {
        if (updateData.email) {
            const existingEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingEmail && existingEmail._id.toString() !== userId) {
                throw new HttpException(400, "Email already exists");
            }
        }
        
        if (updateData.username) {
            const existingUsername = await userRepository.getUserByUsername(updateData.username);
            if (existingUsername && existingUsername._id.toString() !== userId) {
                throw new HttpException(400, "Username already exists");
            }
        }

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password;
        }

        const updatedUser = await userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw new HttpException(404, "User not found");
        }
        return updatedUser;
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new HttpException(400, "Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await userRepository.update(userId, { password: hashedPassword });
        if (!updated) {
            throw new HttpException(500, "Failed to update password");
        }
    }

    async getStreak(userId: string): Promise<StreakResponse> {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        const today = getStrippedDate(new Date());
        let currentStreak = user.currentStreak || 0;
        let streakActive = false;

        if (user.lastWorkoutDate) {
            const lastDate = getStrippedDate(user.lastWorkoutDate);
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                streakActive = true;
            } else {
                currentStreak = 0;
            }
        }

        return {
            currentStreak,
            longestStreak: user.longestStreak || 0,
            lastWorkoutDate: user.lastWorkoutDate,
            streakActive,
        };
    }

    async getDashboard(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        // Get streak
        const streak = await this.getStreak(userId);

        // Get workout completions
        const workoutCompletions = await workoutCompletionRepository.getWorkoutCompletionsByUserId(userId);
        const totalCompleted = workoutCompletions.length;

        // Calculate weekly completed (last 7 days)
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        const weeklyCompleted = workoutCompletions.filter(
            (completion) => new Date(completion.completedAt) >= weekAgo
        ).length;

        // Get achievements
        const userAchievements = await userAchievementRepository.getUserAchievementsByUserId(userId);
        const allAchievements = await achievementRepository.getAchievements(1, 100);
        const unlockedCount = userAchievements.length;
        const totalCount = allAchievements.total;
        const latestAchievement = userAchievements.sort(
            (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
        )[0];

        // Get recent activity
        const recentActivity = [
            ...workoutCompletions.map(completion => ({
                type: "workout" as const,
                title: "Workout Completed",
                description: "You completed a workout",
                date: completion.completedAt,
                xpEarned: completion.xpEarned,
                coinEarned: completion.coinEarned,
            })),
            ...userAchievements.map(ua => ({
                type: "achievement" as const,
                title: "Achievement Unlocked",
                description: "You unlocked an achievement",
                date: ua.unlockedAt,
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        return {
            user: {
                level: user.level || 0,
                xp: user.xp || 0,
                coins: user.coins || 0,
            },
            streak: {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                lastWorkoutDate: streak.lastWorkoutDate,
                streakActive: streak.streakActive,
            },
            workouts: {
                totalCompleted,
                weeklyCompleted,
            },
            achievements: {
                unlockedCount,
                totalCount,
                latestAchievement,
            },
            recentActivity,
        };
    }
}
