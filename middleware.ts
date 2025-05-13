// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

// Just export Clerk’s middleware with no extra callback.
// This will make sure every page request—even public ones—has the Clerk context.
export default clerkMiddleware();

export const config = {
  // match all Next.js routes except the build internals and static assets:
  matcher: [
    /*
     * Matches everything except:
     *  - _next internals
     *  - static files (css, js, images…)
     *  - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
