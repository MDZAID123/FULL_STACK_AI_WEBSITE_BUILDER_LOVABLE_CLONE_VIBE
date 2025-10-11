

// A procedure can either be for fetching data 
// A procedure can either be for mutating data 



import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import {  createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

import {generateSlug} from "random-word-slugs";
import { consumeCredits } from "@/lib/usage";

//in our project protectedprocedure is a wrapper that ensures 
//the user is authenticated 
//input output is validated 



//Procedure-strongly typed server side function (api endpoint) that
//that you frontend calls directly with full type inference 


//This files defines the messagesRouter which groups all procedures related to Messages 



export const projectsRouter=createTRPCRouter({


    

    getOne:protectedProcedure
    .input(z.object({
        id: z.string().min(1,{message:"Id is required"}),
    }))
    .query(async({input,ctx})=>{
        const existingProject=await prisma.project.findUnique({
            where :{
                id:input.id,
                userId:ctx.auth.userId,
            },
        });

        if(!existingProject){
            throw new TRPCError({code:"NOT_FOUND",message:"Project not found"});

        }
        return existingProject;
    }),


    //this getmany procedure is used and called from frontend to display conversion history for a project

    getMany:protectedProcedure
    // .input(
    //     z.object({
    //         projectId:z.string().min(1,{message:"Project ID is required"}),

    //     }),

    // )
    .query(async({input,ctx})=>{
        const projects=await prisma.project.findMany({
            where:{
                // projectId:input.projectId,
                // project:{
                    userId:ctx.auth.userId,
                // },
            },
            
            orderBy:{
                updatedAt:"asc",
            },
        });
        return projects;
    }),

    //Used and called from frontend  when a user sends a new message/query


    create:protectedProcedure
    .input(
        z.object({
            value:z.string()
                .min(1,{message:"Value  is required" })
                .max(10000,{message:"Value is too long"})
        
            // projectId:z.string().min(1,{message:"Project ID is required"}),


        
        }),
    )
    .mutation(async ({input,ctx})=>{


          try{
                await consumeCredits();
            }catch(error){
                if(error instanceof Error){
                    throw new TRPCError({code:"BAD_REQUEST",message:"Something went wrong"});
                }else{
                    throw new TRPCError({
                        code:"TOO_MANY_REQUESTS",
                        message:"You have run out of credits"
                    })
                }
            }




        const createdProject=await prisma.project.create({
            data:{
                userId:ctx.auth.userId,
                name:generateSlug(2,{
                    format:"kebab",
                }),
                messages:{
                    create:{
                        content:input.value,
                        role:"USER",
                        type:"RESULT",
                    }
                }

            }
        })



        await inngest.send({
            name:"code-agent/run",
            data:{
                value:input.value,
                projectId:createdProject.id,
            }
        })

        return createdProject;
        





        // const existingProject=await prisma.project.findUnique({
        //     where:{
        //         id:input.projectId,
        //         userId:ctx.auth.userId,
        //     },
        // });


        // if(!existingProject){

        //     throw new TRPCError({code:"NOT_FOUND",message:"Project not found" });


        // }

        // try{
        //     await consumeCredits();

        // }catch(error){
        //     if(error instanceof Error){
        //         throw new TRPCError({code:"BAD_REQUEST",message:"Something went wrong" });

        //     }else{
        //         throw new TRPCError({
        //             code:"TOO_MANY_REQUESTS",
        //             message:"You have run out of credits"
        //         });
        //     }
        // }

        
        

        // const createdMessage=await prisma.message.create({
        //     data:{
        //         projectId:existingProject.id,
        //         content:input.value,
        //         role:"USER",
        //         type:"RESULT",
        //     },
        // });


        // await inngest.send({
        //     name:"code-agent/run",
        //     data:{
        //         value:input.value,
        //         projectId:input.projectId,
        //     }
        // });

        // return createdMessage;
    })
})