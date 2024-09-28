import { OAuth2RequestError } from "arctic";

import { appendHeader, createError, getCookie, getQuery, sendRedirect } from "vinxi/http";
import { github } from "~/server/auth";

import type { APIEvent } from "@solidjs/start/server";
import { GITTHUB_TOKEN_COOKIE_NAME, GITTHUB_USER_ID_COOKIE_NAME } from "~/server/config";

export async function GET({ nativeEvent: event }: APIEvent) {
    const query = getQuery(event);
    const code = query.code?.toString() ?? null;
    const state = query.state?.toString() ?? null;
    const storedState = getCookie(event, "github_oauth_state") ?? null;
    if (!code || !state || !storedState || state !== storedState) {
        throw createError({
            status: 400,
        });
    }

    try {
        const tokens = await github.validateAuthorizationCode(code);
        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const githubUser: GitHubUser = await githubUserResponse.json();

        appendHeader(
            event,
            "Set-Cookie",
            `${GITTHUB_USER_ID_COOKIE_NAME}=${githubUser.id}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600`,
        );
        appendHeader(
            event,
            "Set-Cookie",
            `${GITTHUB_TOKEN_COOKIE_NAME}=${tokens.accessToken}; Path=/; Secure; SameSite=Lax; Max-Age=3600`,
        );

        return sendRedirect(event, "/");
    } catch (e) {
        if (e instanceof OAuth2RequestError && (e as OAuth2RequestError).message === "bad_verification_code") {
            // invalid code
            throw createError({
                status: 400,
            });
        }
        console.error(e);
        throw createError({
            status: 500,
        });
    }
}
interface GitHubUser {
    id: number;
}
