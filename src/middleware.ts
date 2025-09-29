

//This middleware.ts is the security gate of our full stack next js +clerck app 

import {clerkMiddleware,createRouteMatcher} from "@clerk/nextjs/server";




//create router matcher is a utility to check if a request url matches certain pattern

//first we are defining public routes
const isPublicRoute=createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
    "/pricing(.*)",
])


export default clerkMiddleware(async (auth,req)=>{

    if(!isPublicRoute(req)){
        await auth.protect();
    }
})

//the above middleware logic runs for every incoming request 
//if the route is not public clerk will 
//check authentication
//redirect unauthorized user to sign-in



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

//The above config matcher controls where the middleware runs 
