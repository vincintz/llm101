import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// TODO: add public and private routes

const isPublicRoute = createRouteMatcher([ "/", "/pricing" ])

export default clerkMiddleware((auth, request) => {
  // if not authenticated, and access private route => redirect to login
  if (!auth().userId && !isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
