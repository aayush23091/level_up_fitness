export interface FallbackResult {
  text: string;
  isFallback: boolean;
}

const WORKOUT_FALLBACK = `Here is a solid weekly split to build muscle:

Push: Bench Press 3x8-12, Shoulder Press 3x8-12, Incline Dumbbell 3x10, Lateral Raises 3x15, Triceps Extensions 3x12

Pull: Pull Ups 3x8, Rows 3x10, Lat Pulldown 3x12, Curls 3x12

Legs: Squats 3x8, Leg Press 3x12, Leg Curl 3x12, Calf Raises 4x15

Focus on progressive overload — add weight or reps when it feels easy. Keep leveling up!`;

const NUTRITION_FALLBACK = `Fuel your training with these nutrition essentials:

Protein: 1.6-2.2g per kg of bodyweight daily from chicken, fish, eggs, Greek yogurt, tofu, and lentils.

Calories: Eat 250-300 kcal above maintenance to build muscle, or 300-500 kcal below to lose fat.

Hydration: Drink 3-4 liters of water daily, plus 500ml around your workout.

Stick to whole foods and eat protein with every meal for better recovery.`;

const MOTIVATION_FALLBACK = `You've got this! Every rep, every walk, every healthy meal is progress. Results take time — stay patient and consistent. Show up today, even if it's just a short session. Your future self will thank you. Keep leveling up!`;

const GENERAL_FALLBACK = `Here are some quick fitness tips to help you level up 💪

Train 3-4 times per week mixing strength and cardio. Eat protein with every meal to support recovery. Stay hydrated and prioritize 7-9 hours of sleep. Track progress and celebrate small wins.

Ask me about workouts, nutrition, or motivation for more focused advice!`;

export class FitnessFallbackService {
  getFallback(message: string): FallbackResult {
    const text = message.toLowerCase();

    if (/(workout|exercise|training|lift|gym|muscle|strength|reps?|sets?)/.test(text)) {
      return { text: WORKOUT_FALLBACK, isFallback: true };
    }

    if (/(diet|food|nutrition|eat|eating|meal|protein|calorie|carbs|fat|weight loss|cut)/.test(text)) {
      return { text: NUTRITION_FALLBACK, isFallback: true };
    }

    if (/(motivat|inspir|tired|lazy|give up|stuck|mental|disciplin|habit)/.test(text)) {
      return { text: MOTIVATION_FALLBACK, isFallback: true };
    }

    return { text: GENERAL_FALLBACK, isFallback: true };
  }
}

export const fitnessFallbackService = new FitnessFallbackService();
