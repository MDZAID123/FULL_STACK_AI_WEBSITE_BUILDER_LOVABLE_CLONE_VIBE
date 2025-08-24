import { inngest } from "./client";


import {Sandbox} from "@e2b/code-interpreter";
import { Agent, openai, createAgent, createTool ,createNetwork } from "@inngest/agent-kit";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import {z,ZodType}from "zod";
import { PROMPT } from "@/prompt";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {


    const sandboxId=await step.run("get-sandbox-id",async()=>{
        const sandbox=await Sandbox.create("vibe-nextjs-test-2");
        return sandbox.sandboxId;
    })

    //after we have a sandbox id we need to create a sandbox url 

    //note we need to preserve above step throughout the course of time 

    // //Imagine this is a download step 
    // await step.sleep("wait-a-moment", "30s");

    // //Imagine this is a transcript step 
    // await step.sleep("wait-a-moment", "10s");

    //we now need a way to invoke this summarize agent using event data value 

      const codeAgent = createAgent({
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
                {step,network}
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

    const network =createNetwork({
        name:"coding-agent-network",
        agents:[codeAgent],
        maxIter:15,
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


    const result=await network.run(event.data.value);



    // const {output}=await summarizer.run(
    //     `Write the following snippet: ${event.data.value}`,
    // )

    console.log("OUTPUT",result);


    const sandboxUrl=await step.run("get-sandbox-url",async()=>{
        const sandbox=await getSandbox(sandboxId);
        const host= sandbox.getHost(3000);

        return `https://${host}`;

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