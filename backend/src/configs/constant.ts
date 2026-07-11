import dotenv from "dotenv";
dotenv.config(); // implement .env file

// Add fallback value from env for stability
export const PORT: number = Number(process.env.PORT) || 8089; // default port is 8089
export const DUMMY: string = process.env.DUMMY || "Dummy Export";    
export const MONGODB_URL: string = 
    process.env.MONGODB_URL || "mongodb://localhost:27017/class-36a-db"; // default MongoDB URL
export const SECRET_KEY: string = 
    process.env.SECRET_KEY || "merosecretkey";
export const EMAIL_HOST: string = 
    process.env.EMAIL_HOST || "smtp.gmail.com";
export const EMAIL_PORT: number = 
    Number(process.env.EMAIL_PORT) || 587;
export const EMAIL_USER: string = 
    process.env.EMAIL_USER || "";
export const EMAIL_PASSWORD: string = 
    process.env.EMAIL_PASSWORD || "";
export const FRONTEND_URL: string = 
    process.env.FRONTEND_URL || "http://localhost:3000";
// same as 
// export {
//     PORT,
//     DUMMY,
//     MONGODB_URL
// }