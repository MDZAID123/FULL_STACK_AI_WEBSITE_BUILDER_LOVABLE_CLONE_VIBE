"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";


interface HintProps{
    children:React.ReactNode;
    text:string;
    side?:"top"|"right"|"bottom"|"left";
    align?:"start"|"center"|"end";
}


//when we hover oover the child component wrapped in this hint component 
//a tooltip pops up saying click to copy


export const Hint=({
    children,
    text,
    side="top",
    align="center"
}:HintProps)=>{

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}

                </TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p>{text}</p>

                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}