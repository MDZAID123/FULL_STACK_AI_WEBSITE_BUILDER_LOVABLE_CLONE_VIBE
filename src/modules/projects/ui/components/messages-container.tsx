import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { set } from "date-fns";
import { useEffect, useRef } from "react";
import { MessageForm } from "./message-form";


interface Props{
    projectId:string;//which project chat to show 
    activeFragment:Fragment|null; //the currently selected fragment 
    setActiveFragment:(fragment:Fragment|null)=>void; //setter for changing active fragment 
}


export const MessagesContainer=({
    projectId,
    activeFragment,
    setActiveFragment
}:Props)=>{

    const trpc=useTRPC(); //API CLIENT
    const bottomRef=useRef<HTMLDivElement>(null); //used to auto-scroll chat to the bottom
    const lastAssistantMessageIdRef=useRef<string|null>(null); //to keep track of last assistant message



    const {data:messages}=useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId:projectId,
    },{
        refetechInterval:2000,
    }));


    //use effect to sync active fragment  
    useEffect(()=>{

        const lastAssistantMessage=messages.findlast(
            (message)=>message.role === "ASSISTANT"
        );

        if(lastAssistantMessage?.fragment && lastAssistantMessage.id !==lastAssistantMessageIdRef.current){
            setActiveFragment(lastAssistantMessage.fragment);
            lastAssistantMessageIdRef.current=lastAssistantMessage.id;

        },[messages,setActiveFragment]


    )

    //whenever messages changes find the last assistant mesage role=="Assistant"
    //if it has a fragment and its not the same as previously processed one -set it as the active fragment 
    //prevents reselecting the same fragment multiple times 
    //this is how the right panel auto updates when the assistant sends new code 
       

    //use Effect to auto scroll  messages to bottom 

    useEffect(()=>{

        bottomRef.current?.scrollIntoView();

    },[messages.length]);

    //When the number of messages changes srcoll to bottom 


    //Last Message Check 
    const lastMessage=messages[messages.length-1];
    const isLastMessageUser=lastMessage?.role === "USER";

    //check if the last message is from the user
    //if its true then show messageloadig spinner (waiting for assistant reply)



    return (
        <div className="flex flex-col flex-1 min-h-0" >
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">

                    {messages.map((message)=>(

                        <MessageCard

                        key={message.id}
                        content={message.content}
                        role={message.role}
                        fragment={message.fragment}
                        createdAt={message.createdAt}
                        isActiveFragment={activeFragment?.id === message.fragment?.id}
                        onFragmentClick={()=>setActiveFragment(message.fragment)}
                        type={message.type}
                        
                        
                        />


                    ))}

                    {isLastMessageUser && <MessageLoading/>}

                    <div ref={bottomRef}/>



                </div>

            </div>
            {/* Message form always present at the bottom  */}

            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none">
                        <MessageForm projectId={projectId}/>
                </div>

            </div>


        </div>
    )


}