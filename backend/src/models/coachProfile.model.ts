import mongoose, { Schema, Document } from "mongoose";

export interface ICoachProfile extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    bio: string;
    specialization: string[];
    experience: string;
    rating: number;
    totalClients: number;
    hireCost: number;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CoachProfileMongoSchema: Schema = new Schema<ICoachProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        bio: { type: String, required: true },
        specialization: { type: [String], required: true },
        experience: { type: String, required: true },
        rating: { type: Number, default: 0 },
        totalClients: { type: Number, default: 0 },
        hireCost: { type: Number, required: true },
        available: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
);

export const CoachProfileModel = mongoose.model<ICoachProfile>(
    "CoachProfile",
    CoachProfileMongoSchema
);
