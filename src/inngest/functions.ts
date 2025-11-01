import { inngest } from "./client";


import {Sandbox} from "@e2b/code-interpreter";
import { Agent, openai, createAgent, createTool ,createNetwork, Tool, Message, createState } from "@inngest/agent-kit";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import {z,ZodType}from "zod";
import { PROMPT,FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./type";



interface AgentState{
    summary:string;
    files:{[path:string]:string};
}
export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {


    const sandboxId=await step.run("get-sandbox-id",async()=>{
        const sandbox=await Sandbox.create("vibe-nextjs-test-2");
        await sandbox.setTimeout(SANDBOX_TIMEOUT);//this will now be alive for an hour for hobby users 
        //for more timeout then this we would be requiring 
        //the more longer you put timeout the more you will spend credits 

        return sandbox.sandboxId;
    })

    //

    const previousMessages=await step.run("get-previous-messages",async()=>{
        const formattedMessages:Message[]=[];

        const messages=await prisma.message.findMany({
            where:{
                projectId:event.data.projectId,
            },
            orderBy:{
                createdAt:"desc",  //TODO CHANGE TO ASC IF AI DOES NOT UNDERSTAND THE LATEST MESSAGE 
            },
            take:5,
        });
        //now let push each of the message we fetch from prisma db to th formatted message 
        
        for(const message of messages){
            formattedMessages.push({
                type:"text",
                role:message.role === "ASSISTANT" ? "assistant":"user",
                content:message.content,
            })
        }
        return formattedMessages.reverse();
        //now due to this the agent will have the context of the entire conversation


    });

    const state=createState<AgentState>({
        summary:"",
        files:{},
    },{
        messages:previousMessages
    },);

    console.log("previous messages of the current chat ")
    console.log(previousMessages)
    //now we will add this agent state created above to several places



    //after we have a sandbox id we need to create a sandbox url 

    //note we need to preserve above step throughout the course of time 

    // //Imagine this is a download step 
    // await step.sleep("wait-a-moment", "30s");

    // //Imagine this is a transcript step 
    // await step.sleep("wait-a-moment", "10s");

    //we now need a way to invoke this summarize agent using event data value 

      const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description:"An expert coding agent",
      system:PROMPT,
    //   system: "You are an expert next.js developer You write readable maintainable code.You write simple NEXT.js and React snippets ",
      model: openai({ 
        model: "gpt-4o" ,
        defaultParameters:{
            temperature:0.1,
        }
    }),
      tools:[
        createTool({
            name:"terminal",
            description:"Use the terminal to run commands",
            parameters:z.object({
                command:z.string(),
            }) ,
            handler:async ({command},{step})=>{
                return await step?.run("terminal",async()=>{
                    const buffers={stdout:"",stderr:""};

                    try {
                        const sandbox=await getSandbox(sandboxId);
                        const result=await sandbox.commands.run(command,{
                            onStdout:(data:string)=>{
                                buffers.stdout+=data;
                            },
                            onStderr:(data:string)=>{
                                buffers.stderr+=data;
                            }

                        })
                        return result.stdout;
                    }catch(e){
                       console.error(`Command failed:${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`);

                       return `Command failed:${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`;

                    }
                })
            }

        }),
        createTool({
            name:"createOrUpdateFiles",
            description:"Create or update files in the sandbox",
            parameters:z.object({
                files:z.array(
                    z.object({
                        path:z.string(),
                        content:z.string(),
                    }),
                ),

            }),
            handler:async(
                {files},
                {step,network}:Tool.Options<AgentState>
            )=>{
                const newFiles=await step?.run("createOrUpdateFiles",async()=>{
                    try{
                        const updatedFiles=network.state.data.files||{};
                        const sandbox=await getSandbox(sandboxId);

                        for(const file of files){
                            await sandbox.files.write(file.path,file.content);
                            updatedFiles[file.path]=file.content;
                        }

                        return updatedFiles;
                    }catch(e){
                        return "Error"+e;

                    }

                });

                if(typeof newFiles === "object"){
                    network.state.data.files=newFiles;
                }


            }
        }),

        // Creating a tool for reading files 

        createTool({
            name:"readFiles",
            description:"Read files from the sandbox",
            parameters:z.object({
                files:z.array(z.string()),

            }),
            handler:async ({files},{step})=>{
                return await step?.run("readFiles",async()=>{
                    try{
                        const sandbox=await getSandbox(sandboxId);
                        const contents=[];
                        for(const file of files){
                            const content=await sandbox.files.read(file);
                            contents.push({path:file,content});
                        }
                        return JSON.stringify(contents);
                    }catch (e){
                        return "Error:"+e;

                    }
                })
            }
        })





      ],

      //after array of tools defined we need to add lifecycle 

      lifecycle:{
        onResponse: async ({result,network})=>{
            console.log("DEBUG - onResponse result", JSON.stringify(result, null, 2));
            const lastAssistantMessageText=
            lastAssistantTextMessageContent(result);

            if(lastAssistantMessageText && network){
                if(lastAssistantMessageText.includes("<task_summary>")){
                    network.state.data.summary=lastAssistantMessageText;
                }
            }

            return result;
        }
      }
    });


    //creating network of agents 

    const network =createNetwork<AgentState>({
        name:"coding-agent-network",
        agents:[codeAgent],
        maxIter:15,
        defaultState:state,
        router:async({network})=>{
            const summary=network.state.data.summary;

            if(summary){
                return;
            }
            return codeAgent;
        }
    })
    //if we detect this summary in the network state we will break the network .



    // //Imagine this is a summary step 
    // await step.sleep("wait-a-moment", "5s");

    // const {output }=await codeAgent.run(
    //         `Write the following snippet: ${event.data.value}`,
    // );


    const result=await network.run(event.data.value,{state:state});

    //after we get the result from the network we would create another agent for fragment title generator 

    const fragmentTitleGenerator=createAgent({
        name:"fragment-title-generator",
        description:"A fragment title generator",
        system:FRAGMENT_TITLE_PROMPT,
        model:openai({
            model:"gpt-4o",
        })
    })

    //defining the second agent for summarizingt the response 
    const responseGenerator=createAgent({
        name:"response-generator",
        description:"A response generator",
        system:RESPONSE_PROMPT,
        model:openai({
            model:"gpt-4o",

        })
    })

    const  {output:fragmentTitleOutput}=await fragmentTitleGenerator.run(result.state.data.summary)


    const {output :responseOutput}=await responseGenerator.run(result.state.data.summary);


    const isError=!result.state.data.summary||Object.keys(result.state.data.files||{}).length ===0;


    const parseAgentOutput=(value:Message[])=>{

        // const output=fragmentTitleOutput[0];
        const output=value[0];
        if(output.type!== "text"){
            return "Fragment";
        }
        if(Array.isArray(output.content)){
            return output.content.map((txt)=>txt).join("");
        }else{
            return output.content;
        }
    }

    // const generateResponse=()=>{
    //     if(responseOutput[0].type!== "text"){
    //         return "Here you go";
    //     }
    //     if(Array.isArray(responseOutput[0].content)){
    //         return responseOutput[0].content.map((txt)=>txt).join("");
    //     }
    //     else{
    //         return responseOutput[0].content;
    //     }
    // }




    // const {output}=await summarizer.run(
    //     `Write the following snippet: ${event.data.value}`,
    // )

    console.log("OUTPUT",result);


    const sandboxUrl=await step.run("get-sandbox-url",async()=>{
        const sandbox=await getSandbox(sandboxId);
        const host= sandbox.getHost(3000);

        return `https://${host}`;

    });


    //adding one more step here in inngest 

    await step.run("save-result",async()=>{
        if(isError){
            return await prisma.message.create({
                data:{
                    projectId:event.data.projectId,
                    content:"Something went wrong .Please try again",
                    role:"ASSISTANT",
                    type:"ERROR",
                },
            })
        }

        return await prisma.message.create({
            data:{
                projectId:event.data.projectId,
                content:parseAgentOutput(responseOutput),
                // content:result.state.data.summary,
                // content:generateResponse(),
                role:"ASSISTANT",
                type:"RESULT",
                fragment:{
                    create:{
                        sandboxUrl:sandboxUrl,
                        // title:"Fragment",
                        // title:generateFragmentTitle(),
                        title:parseAgentOutput(fragmentTitleOutput),
                        files:result.state.data.files,
                    }
                }
            }
        })
    })

    


     
    // return { message: `Hello ${event.data.value}!` };
    // return {output,sandboxUrl};

    return {
        url:sandboxUrl,
        title:"Fragment",
        files:result.state.data.files,
        summary:result.state.data.summary,
    }
  },
);