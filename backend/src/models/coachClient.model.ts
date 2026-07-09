import mongoose, { Schema, Document } from "mongoose";

export interface ICoachClient extends Document {
    _id: mongoose.Types.ObjectId;
    coachId: mongoose.Types.ObjectId;
    athleteId: mongoose.Types.ObjectId;
    transactionId: mongoose.Types.ObjectId;
    hiredAt: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const CoachClientMongoSchema: Schema = new Schema<ICoachClient>(
    {
        coachId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        athleteId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", required: false },
        hiredAt: { type: Date, required: true },
        status: { type: String, enum: ["active", "inactive"], default: "active" }
    },
    {
        timestamps: true
    }
);

// Compound index to prevent duplicate coach-athlete relationships
CoachClientMongoSchema.index({ coachId: 1, athleteId: 1 }, { unique: true });

export const CoachClientModel = mongoose.model<ICoachClient>(
    "CoachClient",
    CoachClientMongoSchema
);
