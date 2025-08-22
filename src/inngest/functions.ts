import { inngest } from "./client";


import {Sandbox} from "@e2b/code-interpreter";
import { Agent, openai, createAgent } from "@inngest/agent-kit";
import { getSandbox } from "./utils";
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

      const summarizer = createAgent({
      name: "code-agent",
      system: "You are an expert next.js developer You write readable maintainable code.You write simple NEXT.js and React snippets ",
      model: openai({ model: "gpt-4o" }),
    });

    // //Imagine this is a summary step 
    // await step.sleep("wait-a-moment", "5s");



    const {output}=await summarizer.run(
        `Write the following snippet: ${event.data.value}`,
    )

    console.log("OUTPUT",output);


    const sandboxUrl=await step.run("get-sandbox-url",async()=>{
        const sandbox=await getSandbox(sandboxId);
        const host= sandbox.getHost(3000);

        return `https://${host}`;

    })

    


     
    // return { message: `Hello ${event.data.value}!` };
    return {output,sandboxUrl};
  },
);