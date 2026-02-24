import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth endpoints)
         * - api/cron (Our cronjobs)
         * - login (Login page)
         * - register (Register page)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json (PWA manifest)
         * - icons (PWA icons)
         */
        "/((?!api/auth|api/cron|login|register|_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
    ],
};
