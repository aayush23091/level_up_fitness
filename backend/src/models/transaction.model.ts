import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  amount: number;
  adminCommission: number;
  coachEarning: number;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionMongoSchema: Schema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coachId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    adminCommission: { type: Number, required: true },
    coachEarning: { type: Number, required: true },
    type: { type: String, default: "coach_hire" },
    status: { type: String, default: "completed" },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = mongoose.model<ITransaction>(
  "Transaction",
  TransactionMongoSchema
);
