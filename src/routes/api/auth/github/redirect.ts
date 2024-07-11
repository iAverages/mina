import { generateState } from "arctic";

import type { APIEvent } from "@solidjs/start/server";
import { github } from "~/server/auth";
import { sendRedirect, setCookie } from "vinxi/http";

export async function GET({ nativeEvent: event }: APIEvent) {
    const state = generateState();
    const url = await github.createAuthorizationURL(state, {
        scopes: ["read:user", "read:org", "repo"],
    });

    setCookie(event, "github_oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
    });
    return sendRedirect(event, url.toString());
}
