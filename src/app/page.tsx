// "use client"
import React, { Suspense, use } from 'react'
import { useTRPC } from '@/trpc/client'
import { dehydrate, HydrationBoundary, useQuery } from '@tanstack/react-query';



import {caller, getQueryClient,trpc} from '@/trpc/server';
import { Client } from './client';
const page = async() => {
  // const trpc=useTRPC();
  // const {data}=useQuery(trpc.createAI.queryOptions({ text: 'Antonio' }));
  // trpc.createAI.queryOptions({ text: 'world' });
  // instead of doing localhost:3000/api/create-ai"

  // const data=await caller.createAI({ text: 'Antonio' });



  // console.log("SERVER COMPONENT"); 

  const queryClient=getQueryClient();
  void queryClient.prefetchQuery(trpc.createAI.queryOptions({text:"Antonio PREFETCH"}));
  //prefetch query does not return anything
  
  return (
   <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<p>Loading...</p>}>

    
    <Client/>
    </Suspense>
   </HydrationBoundary>
  )
}

export default page