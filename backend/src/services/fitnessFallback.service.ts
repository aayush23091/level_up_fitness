export interface FallbackResult {
  text: string;
  isFallback: boolean;
}

const WORKOUT_FALLBACK = `Here is a muscle-building workout plan:

Day 1 Push:
- Bench Press 3x8-12
- Shoulder Press 3x8-12
- Incline Dumbbell Press 3x10
- Lateral Raises 3x15
- Triceps Extensions 3x12

Day 2 Pull:
- Pull Ups 3x8
- Rows 3x10
- Lat Pulldown 3x12
- Curls 3x12

Day 3 Legs:
- Squats 3x8
- Leg Press 3x12
- Leg Curl 3x12
- Calf Raises 4x15`;

const NUTRITION_FALLBACK = `Here is some nutrition guidance to support your training:

Protein-focused meals:
- Aim for 1.6-2.2g of protein per kg of bodyweight daily.
- Include lean sources like chicken, fish, eggs, Greek yogurt, tofu, and lentils.
- Spread protein across 3-4 meals to maximize muscle protein synthesis.

Calorie advice:
- To build muscle, eat in a slight surplus (250-300 kcal above maintenance).
- To lose fat, stay in a moderate deficit (300-500 kcal below maintenance).
- Prioritize whole foods over processed options for satiety and nutrients.

Hydration advice:
- Drink ~3-4 liters of water per day, more on training days.
- Have 500ml of water around your workout window.
- Monitor urine color: pale yellow means you are well hydrated.`;

const MOTIVATION_FALLBACK = `You've got this! Every rep, every walk, every healthy meal is a small win that compounds over time. Progress isn't always linear, so be patient and consistent. Show up today, even if it's just a short session — your future self will thank you. Keep leveling up!`;

const GENERAL_FALLBACK = `I'm running on a built-in assistant right now. Here are a few quick tips:

- Train 3-4 times per week with a mix of strength and cardio.
- Eat protein with every meal to support recovery.
- Stay hydrated and aim for 7-9 hours of sleep.
- Track your progress and celebrate small wins.

If you ask about a specific workout, nutrition, or motivation, I can give more focused advice!`;

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
