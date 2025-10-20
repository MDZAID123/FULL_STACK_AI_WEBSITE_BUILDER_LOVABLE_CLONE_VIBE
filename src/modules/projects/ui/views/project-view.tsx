"use client"

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";


import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-header";
import { MessagesContainer } from "../components/messages-container";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { FragmentWeb } from "../components/fragment-web";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
interface Props{
    projectId:string;
}
export const ProjectView=({projectId}:Props)=>{
    const trpc=useTRPC();

    const { has }=useAuth();
    const hasProAccess=has?.({plan:"pro"});


    //setting up the active fragment
    const [activeFragment,setActiveFragment]=useState<Fragment | null>(null);

    const [tabState,setTabState]=useState<"preview"|"code">("preview");
    

    const {data:project}=useSuspenseQuery(trpc.projects.getOne.queryOptions({
        id:projectId,
    }))

    const {data:messages}=useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId:projectId,
    }))

    return (

        // <div>
        //     {JSON.stringify(project)}
        //     {JSON.stringify(messages,null,2)}
        // </div>
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">

                <ResizablePanel
                defaultSize={35}
                minSize={20}
                className="flex flex-col min-h-0">
                    <ErrorBoundary fallback={<p>Project header Error</p>}>
                        <Suspense fallback={<p>Loading project ...</p>}>
                            <ProjectHeader projectId={projectId}/>
                        </Suspense>


                    </ErrorBoundary>


                    <ErrorBoundary fallback={<p>Message container Error</p>}>
                        <Suspense fallback={<p>Loading messages...</p>}>
                        <MessagesContainer

                        projectId={projectId}
                        activeFragment={activeFragment}
                        setActiveFragment={setActiveFragment}


/>

                        </Suspense>

                    </ErrorBoundary>
                    


                </ResizablePanel>


                <ResizableHandle className="hover:bg-primary transition-colors"/>
                {/* The Above is a drag bar btw 2 resizable panels */}

                <ResizablePanel
                defaultSize={65}
                minSize={50}
                >

                    <Tabs
                    className="h-full gap-y-0"
                    defaultValue="preview"
                    value={tabState}
                    onValueChange={(value)=>setTabState(value as "preview"|"code")}

                    >

                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview"  className="rounded-md">

                                    <EyeIcon/> <span>Demo</span>




                                </TabsTrigger>


                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon/><span>Code</span>

                                </TabsTrigger>

                            </TabsList>

                            <div className="ml-auto flex items-center gap-x-2">

                                {!hasProAccess && (
                                    <Button asChild size="sm" variant="ghost">
                                        <Link href="pricing">

                                        <CrownIcon/>Upgrade
                                        </Link>

                                    </Button>
                                )}

                                <UserControl/>

                            </div>

                        </div>

                        <TabsContent  value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment}/>}


                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer
                                files={activeFragment.files as {[path:string]:string}}
                                />
                            )}
                        </TabsContent>

                    </Tabs>


                </ResizablePanel>

            </ResizablePanelGroup>

        </div>
    )


}