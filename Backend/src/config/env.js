import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().default(8000),

    // Database
    MONGO_URI: z.string().min(1, "MONGO_URI is required"),

    // CORS
    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),

    // JWT
    ACCESS_TOKEN_SECRET: z
        .string()
        .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),

    ACCESS_TOKEN_EXPIRY: z.string().default("15m"),

    REFRESH_TOKEN_SECRET: z
        .string()
        .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),

    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z
        .string()
        .min(1, "CLOUDINARY_CLOUD_NAME is required"),

    CLOUDINARY_API_KEY: z
        .string()
        .min(1, "CLOUDINARY_API_KEY is required"),

    CLOUDINARY_API_SECRET: z
        .string()
        .min(1, "CLOUDINARY_API_SECRET is required"),

    // Brevo
    BREVO_API_KEY: z
        .string()
        .min(1, "BREVO_API_KEY is required"),

    // Redis
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("Invalid environment variables:");

    console.error(
        result.error.issues.map((issue) => ({
            variable: issue.path.join("."),
            message: issue.message,
        }))
    );

    process.exit(1);
}

export const env = result.data;