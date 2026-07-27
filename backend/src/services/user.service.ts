import { UserMongoRepository } from "../repositories/user.repository";
import { WorkoutCompletionRepository } from "../repositories/workoutCompletion.repository";
import { UserAchievementRepository } from "../repositories/userAchievement.repository";
import { AchievementRepository } from "../repositories/achievement.repository";
import { WorkoutRepository } from "../repositories/workout.repository";
import { CreateUserDTO, LoginUserDTO, ChangePasswordDTO, ForgotPasswordDTO, ResetPasswordDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "./email.service";
import { SECRET_KEY, FRONTEND_URL } from "../configs/constant";

const userRepository = new UserMongoRepository();
const workoutCompletionRepository = new WorkoutCompletionRepository();
const userAchievementRepository = new UserAchievementRepository();
const achievementRepository = new AchievementRepository();
const workoutRepository = new WorkoutRepository();

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

interface AnalyticsResponse {
    overview: {
        totalWorkouts: number;
        totalXP: number;
        totalCoins: number;
        currentStreak: number;
        longestStreak: number;
    };
    workoutTrend: Array<{ date: string; count: number }>;
    weeklyActivity: Array<{ day: string; count: number }>;
    workoutCategories: Array<{ category: string; count: number }>;
    xpProgress: Array<{ date: string; xp: number }>;
    achievementProgress: {
        unlocked: number;
        total: number;
    };
    personalBest: {
        longestStreak: number;
        highestWeeklyWorkout: number;
    };
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

    async forgotPassword(forgotPasswordData: ForgotPasswordDTO): Promise<void> {
        const user = await userRepository.getUserByEmail(forgotPasswordData.email);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        await userRepository.update(user._id.toString(), {
            resetPasswordToken: resetToken,
            resetPasswordExpires,
        });

        const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Reset Your LevelUp Fitness Password</h2>
                <p>Hello ${user.name},</p>
                <p>You requested a password reset.</p>
                <p>Click below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: "Reset Your LevelUp Fitness Password",
            html,
        });
    }

    async resetPassword(resetPasswordData: ResetPasswordDTO, token: string): Promise<void> {
        const user = await userRepository.getUserByResetPasswordToken(token);
        if (!user) {
            throw new HttpException(400, "Invalid or expired reset token");
        }

        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new HttpException(400, "Invalid or expired reset token");
        }

        const hashedPassword = await bcrypt.hash(resetPasswordData.password, 10);
        await userRepository.update(user._id.toString(), {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
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

    async getAnalytics(userId: string): Promise<AnalyticsResponse> {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        const workoutCompletions = await workoutCompletionRepository.getWorkoutCompletionsByUserId(userId);
        const userAchievements = await userAchievementRepository.getUserAchievementsByUserId(userId);
        const allAchievements = await achievementRepository.getAchievements(1, 100);
        const streak = await this.getStreak(userId);

        // Overview
        const totalWorkouts = workoutCompletions.length;
        const totalXP = workoutCompletions.reduce((sum, c) => sum + c.xpEarned, 0);
        const totalCoins = workoutCompletions.reduce((sum, c) => sum + c.coinEarned, 0);

        // Workout Trend (last 30 days)
        const today = getStrippedDate(new Date());
        const workoutTrendMap = new Map<string, number>();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            workoutTrendMap.set(dateStr, 0);
        }
        workoutCompletions.forEach(completion => {
            const dateStr = getStrippedDate(completion.completedAt).toISOString().split('T')[0];
            if (workoutTrendMap.has(dateStr)) {
                workoutTrendMap.set(dateStr, (workoutTrendMap.get(dateStr) || 0) + 1);
            }
        });
        const workoutTrend = Array.from(workoutTrendMap.entries()).map(([date, count]) => ({ date, count }));

        // Weekly Activity (count by weekday)
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weeklyActivityCounts = new Array(7).fill(0);
        workoutCompletions.forEach(completion => {
            const dayIndex = new Date(completion.completedAt).getDay();
            weeklyActivityCounts[dayIndex]++;
        });
        const weeklyActivity = daysOfWeek.map((day, index) => ({ day, count: weeklyActivityCounts[index] }));

        // Workout Categories
        const categoryMap = new Map<string, number>();
        workoutCompletions.forEach(completion => {
            const workout = completion.workoutId as any;
            if (workout?.category) {
                categoryMap.set(workout.category, (categoryMap.get(workout.category) || 0) + 1);
            }
        });
        const workoutCategories = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

        // XP Progress (last 30 days, cumulative)
        const xpProgressMap = new Map<string, number>();
        let cumulativeXP = 0;
        const sortedCompletions = [...workoutCompletions].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
        sortedCompletions.forEach(completion => {
            const dateStr = getStrippedDate(completion.completedAt).toISOString().split('T')[0];
            cumulativeXP += completion.xpEarned;
            xpProgressMap.set(dateStr, cumulativeXP);
        });
        // Fill in gaps
        const xpProgress: Array<{ date: string; xp: number }> = [];
        let lastXP = 0;
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            lastXP = xpProgressMap.get(dateStr) || lastXP;
            xpProgress.push({ date: dateStr, xp: lastXP });
        }

        // Highest Weekly Workout
        let highestWeeklyWorkout = 0;
        const weekMap = new Map<string, number>();
        workoutCompletions.forEach(completion => {
            const d = new Date(completion.completedAt);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
        });
        weekMap.forEach(count => {
            if (count > highestWeeklyWorkout) highestWeeklyWorkout = count;
        });

        return {
            overview: {
                totalWorkouts,
                totalXP,
                totalCoins,
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
            },
            workoutTrend,
            weeklyActivity,
            workoutCategories,
            xpProgress,
            achievementProgress: {
                unlocked: userAchievements.length,
                total: allAchievements.total,
            },
            personalBest: {
                longestStreak: streak.longestStreak,
                highestWeeklyWorkout,
            },
        };
    }
}
