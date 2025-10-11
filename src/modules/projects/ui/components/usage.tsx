// This usage.tsx component is the frontend ui that displays the user's credit 
//usage and reset time 

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon, Link } from "lucide-react";
import { useMemo } from "react";

interface Props{
    points:number;//how many credits user still hasP
    msBeforeNext:number; ///millisecond until reset 
};


export const Usage=({points,msBeforeNext}:Props)=>{
    const {has}=useAuth();//check if the user has a subscription has a plan pro or not 
    const hasProAccess=has?.({plan:"pro"});

    const resetTime=useMemo(()=>{
        try{
            return formatDuration(
                intervalToDuration({
                    start:new Date(),
                    end:new Date(Date.now()+msBeforeNext),
                }),
                {format:["months","days","hours"]}
            )
            
        }catch(error){
            console.error("Error formation duration",error);
            return "unknown";
        }
    },[msBeforeNext]);
    // here we are using date-fns to convert millisecond until resrt to string like 5 days 6 hours 
    //we wrapped it only to recalcuate it when msbeofrnext changes


    return (
        <div className="rounded-t-xl  bg-background border border-b-0 p-2.5">
            <div className="flex items-center gap-x-2">
                <div>
                    <p className="text-sm">
                        {points} {hasProAccess? "":"free"} credits remaining

                    </p>
                    <p className="text-xs text-muted-foreground">
                        Reset in {" "}{resetTime}

                    </p>

                </div>

                {!hasProAccess &&(
                    <Button
                    asChild
                    size="sm"
                    variant="tertiary"
                    className="ml-auto">
                        <Link href="/pricing">
                        <CrownIcon/>Upgrade
                        </Link>

                    </Button>
                )}

            </div>

        </div>
    )
}