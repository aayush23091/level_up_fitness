import mongoose, { Schema, Document } from "mongoose";

export interface ICoachProfile {
    bio?: string;
    specialization?: string[];
    experience?: number;
    hireCost?: number;
    availability?: boolean;
    profileImage?: string;
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    gender: string;
    role: string;
    profilePhoto?: string;
    coachId?: mongoose.Types.ObjectId;
    level?: number;
    xp?: number;
    coins?: number;
    currentStreak?: number;
    longestStreak?: number;
    lastWorkoutDate?: Date;
    coachProfile?: ICoachProfile;
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    arms?: number;
    shoulders?: number;
    legs?: number;
    calves?: number;
    createdAt: Date;
    updatedAt: Date;
}
const UserMongoSchema: Schema = new Schema<IUser>(
    {
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  gender: { type: String, required: true },
  role: { type: String, enum: ["admin", "user", "coach"], default: "user" },
  profilePhoto: { type: String, required: false },
  coachId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  level: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastWorkoutDate: { type: Date, required: false },
  coachProfile: {
    bio: { type: String, required: false },
    specialization: { type: [String], required: false },
    experience: { type: Number, required: false },
    hireCost: { type: Number, required: false },
    availability: { type: Boolean, default: true },
    profileImage: { type: String, required: false }
  },
  height: { type: Number, required: false },
  weight: { type: Number, required: false },
  chest: { type: Number, required: false },
  waist: { type: Number, required: false },
  arms: { type: Number, required: false },
  shoulders: { type: Number, required: false },
  legs: { type: Number, required: false },
  calves: { type: Number, required: false }
},
    {
        timestamps: true // createdAt and updatedAt will be automatically added and managed by mongoose
    }
)
export const UserModel = mongoose.model<IUser>
(
    "User", // db.users -> Model Name "User"
    UserMongoSchema
);
