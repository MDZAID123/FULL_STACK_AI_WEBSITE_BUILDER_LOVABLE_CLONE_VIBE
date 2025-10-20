

//Here we are integrating rate-limiter-flexible with Prisma +Clerk auth to 

import {auth} from "@clerk/nextjs/server"; //this will fetch user info


import {RateLimiterPrisma } from "rate-limiter-flexible";//this rate limiter that stores usage in our prisma databases 

// import {prisma } from "@lib/db";//used by ratelimiterPrisma to persist usage counts
import { prisma } from "@/lib/db";


const FREE_POINTS=10; //FREE USERS GET 2 CREDITS PER MONTH

const PRO_POINTS=100;  //PRO USERS GET 100 CREDITS PER MONTH

const DURATION=30*24*60*60; //30 DAYS RESET USAGE EVERY 30 DAYS

const GENERATION_COST=1; //EACH ACTION EG AI GENERATION API CALL CONSUME 1 CREDITS




export async  function getUsageTracker(){


    const { has }=await auth();

    const hasProAccess=has({plan:"pro"});

    const usageTracker=new RateLimiterPrisma({
        storeClient:prisma,
        tableName:"Usage",
        points:hasProAccess? PRO_POINTS:FREE_POINTS,
        duration:DURATION,
    })

    return usageTracker;
}

//The above function would check the authenticate user plan 
//base don that creates a ratelimiterprisma instance that stores usage in a USAGE TABLE IN OUR DB
//points-total credits allowed (based on plan)

//duration:how long unit credits reset(30 days)

//this function returns a configured tracker for the current user 




export async function consumeCredits(){

    const {userId} =await auth();


    if(!userId){
        throw new Error("User not authenticated");
    }

    const usageTracker=await getUsageTracker();

    const result=await usageTracker.consume(userId,GENERATION_COST);
    return result;
}

//the above function first get the logged in user use id 
//call consume -this will reduce the user's credit balance 
//returns the results object contains remaining points reset time etc 

//use this when a user performs an action that should spend credits



export async function getUsageStatus(){

    const {userId}=await auth();

    if(!userId){
        throw new Error("User not authenticated");
    }

    const usageTracker=await getUsageTracker();

    const result=await usageTracker.get(userId);
    return result;
}
//The above function get the current user 
//fetched their usage record (remainingpoints,consumepoints,expire)


