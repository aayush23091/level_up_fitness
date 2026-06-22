import mongoose, { Schema, Document } from "mongoose";

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
  role: { type: String, enum: ["admin", "user"], default: "user" },
  profilePhoto: { type: String, required: false }
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
