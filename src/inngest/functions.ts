import { inngest } from "./client";


import { Agent, openai, createAgent } from "@inngest/agent-kit";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

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


     
    // return { message: `Hello ${event.data.value}!` };
    return {output}
  },
);