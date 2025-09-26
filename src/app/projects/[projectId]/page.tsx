interface Props{
    params:Promise<{
        projectId:string;
    }>
};

import { ProjectView } from '@/modules/projects/ui/views/project-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react'





const page =async ({params}:Props) => {

    const {projectId}=await params;

    const queryClient=await getQueryClient();

    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }))

    // also prefetching project data before renderijg 
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id:projectId,


    }))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>

        <Suspense fallback={<p>Loading ...</p>}>

        

        <ProjectView projectId={projectId}/>

        </Suspense>

    </HydrationBoundary>
        
    
  )
}

export default page