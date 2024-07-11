import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production"]).default("development"),
        DATABASE_URL: z.string().url(),
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_CLIENT_SECRET: z.string(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
