"use client"
// // "use client"
// import React, { Suspense, use } from 'react'
// import { useTRPC } from '@/trpc/client'
// import { dehydrate, HydrationBoundary, useQuery } from '@tanstack/react-query';



// import {caller, getQueryClient,trpc} from '@/trpc/server';
// import { Client } from './client';
// const page = async() => {
//   // const trpc=useTRPC();
//   // const {data}=useQuery(trpc.createAI.queryOptions({ text: 'Antonio' }));
//   // trpc.createAI.queryOptions({ text: 'world' });
//   // instead of doing localhost:3000/api/create-ai"

//   // const data=await caller.createAI({ text: 'Antonio' });



//   // console.log("SERVER COMPONENT"); 

//   const queryClient=getQueryClient();
//   void queryClient.prefetchQuery(trpc.createAI.queryOptions({text:"Antonio PREFETCH"}));
//   //prefetch query does not return anything
  
//   return (
//    <HydrationBoundary state={dehydrate(queryClient)}>
//     <Suspense fallback={<p>Loading...</p>}>

    
//     <Client/>
//     </Suspense>
//    </HydrationBoundary>
//   )
// }

// export default page


// The above code was only for learning purposed of trpc  


import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
const Page=()=>{
  //ADD TRPC
   const trpc=useTRPC();
   const invoke=useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>{
      toast.success("Background job invoked successfully");
    }
   })); 

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button disabled={invoke.isPending} onClick={()=>invoke.mutate({text:"John"})}>
        Invoke Background job 
      </Button>
      Test
    </div>
  )
}

export default Page;