"use client"
import { ProjectForm } from "@/modules/homes/ui/component/project-form";
import { ProjectList } from "@/modules/homes/ui/component/projects-list";
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


// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { useTRPC } from '@/trpc/client';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { toast } from 'sonner';
// const Page=()=>{
  

//   const router=useRouter();
//    const [value,setValue]=useState("");
//   //ADD TRPC
//    const trpc=useTRPC();
//   //  const {data:messages}=useQuery(trpc.messages.getMany.queryOptions());
//    const createProject=useMutation(trpc.projects.create.mutationOptions({
//         onError:(error)=>{
//           toast.error(error.message);
//         },
//         onSuccess:(data)=>{
//           router.push(`/projects/${data.id}`)
//         }
//    })); 

//   return (
//     <div className="h-screen w-screen flex items-center justify-center">
//       <div className='max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center'>
//       <Input value={value} onChange={(e)=>setValue(e.target.value)}/>
//       <Button disabled={createProject.isPending} onClick={()=>createProject.mutate({value:value})}>
//         Submit
//       </Button>
//       {/* {JSON.stringify(messages,null,2)} */}
//       Test
//     </div>
//     </div>
//   )
// }

// export default Page;



// ##########################


// Main working production code //


import Image from "next/image";

const Page =()=>{

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          <Image
          src="/logo.svg"
          alt="Vibe"
          width={50}
          height={50}
          className="hidden md:block"/>

        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something with Vibe

        </h1>
        <p className="text-lg md:text-cl text-muted-foreground text-center">
          Create apps and websites by chatting with AI

        </p>

        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm/>

        </div>

      </section>
      <ProjectList/>

    </div>
  )
}


export default page;

