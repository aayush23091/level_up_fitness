import nodemailer from "nodemailer";

export interface EmailOptions {
    email: string;
    subject: string;
    html: string;
}

const sendEmail = async ({ email, subject, html }: EmailOptions): Promise<void> => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"LevelUp Fitness" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
    });
};

export default sendEmail;
