import { getCookie, getHeader, sendRedirect } from "vinxi/http";
import { verifyRequestOrigin } from "oslo/request";
import { createMiddleware } from "@solidjs/start/middleware";
import { GITTHUB_TOKEN_COOKIE_NAME } from "~/server/config";

export default createMiddleware({
    onRequest: async (solidEvent) => {
        const event = solidEvent.nativeEvent;
        if (event.node.req.method !== "GET") {
            const originHeader = getHeader(event, "Origin") ?? null;
            const hostHeader = getHeader(event, "Host") ?? null;
            if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
                event.node.res.writeHead(403).end();
                return;
            }
        }

        if (event.path.startsWith("/api/")) {
            return;
        }

        const token = getCookie(event, GITTHUB_TOKEN_COOKIE_NAME);
        if (!token) {
            return sendRedirect(event, "/api/auth/github/redirect");
        }
    },
});
