

// This fragmentweb is an embedded code previewer for a fragment sandbox (environment)
// let us go through it piece by piece and then i will show you a visual sketch of the ui and class usage 

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { Fragment } from "@/generated/prisma";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";

interface Props{
    data:Fragment;
}


export function FragmentWeb({data}:Props){

    const[copied,setCopied]=useState(false);//track if the sandbox url was recently copied use to disable copy button temporarily 

    const [fragmentKey,setFragmentKey]=useState(0);
    //fragment a number that increment each time refresh is clicked 
    //passing it as the key to the ifram force react to remount the iframe (refreshing its content)




    const onRefresh=()=>{
        setFragmentKey((prev)=>prev+1);
    };

    const handleCopy=()=>{
        navigator.clipboard.writeText(data.sandboxUrl);//copied url->show copied state for  2 sec 
        setCopied(true);
        setTimeout(()=>setCopied(false),2000);


    };


    return (
        <div className="flex flex-col w-full h-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
                <Hint text="Refresh" side="bottom" align="start">
                    <Button size="sm" variant="outline" onClick={onRefresh}>
                        <RefreshCcwIcon/>

                    </Button>

                </Hint>
                <Hint text="Open in a new tab" side="bottom" align="start">
                    <Button
                    size="sm"
                    disabled={!data.sandboxUrl}
                    variant="outline"
                    onClick={()=>{
                        if(!data.sandboxUrl) return;
                        window.open(data.sandboxUrl,"_blank");
                    }}>
                        <ExternalLinkIcon/>

                    </Button>

                </Hint>

            </div>

            <iframe
            key={fragmentKey}
            className="h-full w-full"
            sandbox="allow-forms allow-scripts allow-same-origin"
            loading="lazy"
            src={data.sandboxUrl}
            />

        </div>
    )
}
