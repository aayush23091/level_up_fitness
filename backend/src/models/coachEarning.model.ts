import mongoose, { Schema, Document } from "mongoose";

export interface ICoachEarning extends Document {
  coachId: mongoose.Types.ObjectId;
  athleteId: mongoose.Types.ObjectId;
  amount: number;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const CoachEarningMongoSchema: Schema = new Schema<ICoachEarning>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    athleteId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, default: "coach_hire" },
    status: { type: String, default: "completed" },
  },
  {
    timestamps: true,
  }
);

export const CoachEarningModel = mongoose.model<ICoachEarning>(
  "CoachEarning",
  CoachEarningMongoSchema
);
