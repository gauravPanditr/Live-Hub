import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected and webhook routes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)', '/u/(.*)']);  // Added `/u/[username]` here
const isWebhookRoute = createRouteMatcher(['/api/webhooks(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // ✅ Skip Clerk for webhook routes to preserve raw body for signature verification
  if (isWebhookRoute(req)) return;

  // ✅ Require auth only for protected routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always match API and tRPC routes
    '/(api|trpc)(.*)',
  ],
};
