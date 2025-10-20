

import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Usage } from "./usage";

// import { Usage } from "./usage";
interface Props{
    projectId:string;
}


const formSchema=z.object({
    value:z.string()
    .min(1,{message:"Value is required"})
    .max(10000,{message:"Value is too long"}),
})




import { forwardRef } from "react";

const RHFTextarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof TextareaAutosize>>(
  (props, ref) => <TextareaAutosize {...props} ref={ref} />
);




export const MessageForm=({projectId}:Props)=>{

    const trpc=useTRPC();

    const router=useRouter();

    const queryClient=useQueryClient();

    const { data :usage }=useQuery(trpc.usage.status.queryOptions());


    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
            value:"",
        },
        mode:"onChange", //for testing and debugging purpose added this line
        reValidateMode:"onChange", //for testing and debugging purpose added this line
    });

    //react query mutation (send message)
    const createMessage=useMutation(trpc.messages.create.mutationOptions({
        onSuccess:()=>{
            form.reset();
            queryClient.invalidateQueries(
                trpc.messages.getMany.queryOptions({projectId}),
            );
            queryClient.invalidateQueries(
                trpc.usage.status.queryOptions()
            );
            // when we create a new message we automatically invalidate the queries

        },
        onError:(error)=>{
            toast.error(error.message);

            
            if (error.data?.code === "TOO_MANY_REQUESTS"){
                router.push("/pricing");
            }


        }

    }))

        // sends a new message to backend with projectId
    // const onSubmit=async (values:z.infer<typeof formSchema>)=>{
    //     console.log("Submitting message with values:", values, "for projectId:", projectId);

    //     await createMessage.mutateAsync({
    //         value:values.value,
    //         projectId,

    //     });
    // };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
  console.log("✅ SUBMIT triggered with:", values);
  try {
    await createMessage.mutateAsync({
      value: values.value,
      projectId,
    });
  } catch (e) {
    console.error("❌ Mutation error:", e);
  }
};






    //now describing ui state control 

    const [isFocused,setIsFocused]=useState(false);
    const isPending=createMessage.isPending;

    // const isButtonDisabled=isPending || !form.formState.isValid;
    const isButtonDisabled =
  isPending || form.watch("value").trim().length === 0;


    // const  isButtonDisabled=false;
    const showUsage=!!usage;

    console.log("from message form.tsx component for debugging purpose");
    console.log({ isPending, isValid: form.formState.isValid, usage, isButtonDisabled });

    console.log("Current value:", form.watch("value"));
    console.log("Form State:", form.formState);
    console.log("Errors:", form.formState.errors);
    console.log("formState.isDirty:", form.formState.isDirty);
    console.log("form is valid:", form.formState.isValid);


    console.log("field value:", form.getValues("value"));
    console.log("isbutton disabled:", isButtonDisabled);

//     useEffect(() => {
//   console.log("Form state updated:", form.formState);
// }, [form.formState]);






    return (

        <div className="relative z-10 flex flex-col w-full">

      

        <Form {...form}>
            {showUsage &&(
                <Usage
                points={usage.remainingPoints}
                msBeforeNext={usage.msBeforeNext}
                />
            )}
            <form
            // onSubmit={form.handleSubmit(onSubmit)}
              onSubmit={(e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("🟢 Native form submit fired");
    form.handleSubmit(onSubmit)(e);
  }}



            className={cn(
                "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                isFocused && "shadow-xs",
                showUsage && "rounded-t-none",
            )}
            >

                {/* <FormField
                control={form.control}
                name="value"
                render={({field})=>(
                    <TextareaAutosize
                    {...field}
                    disabled={isPending}
                    // onChange={(e) => {
                    // field.onChange(e); // keep react-hook-form aware
                    //      // custom logic here if needed
                    //     }}




                    onFocus={()=>setIsFocused(true)}
                    onBlur={()=>setIsFocused(false)}
                    minRows={2}
                    className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                    placeholder="What would you like to build?"
                    onKeyDown={(e)=>{
                        if(e.key === "Enter" && (e.ctrlKey|| e.metaKey)){
                            e.preventDefault();
                            form.handleSubmit(onSubmit)(e);
                        }
                    }}


                    />
                )}
                /> */}


                {/* new untested code of formfield with rhfttextarea the forward ref wrapper */}
{/* 
                <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <RHFTextarea
                    {...field}
                    disabled={isPending}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    minRows={2}
                    className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                    placeholder="What would you like to build?"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)(e);
                        }
                    }}
                    />
                )}
                /> */}


                {/* <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextareaAutosize
                        ref={field.ref}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        disabled={isPending}
                        onFocus={() => setIsFocused(true)}
                        minRows={2}
                        className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                        placeholder="What would you like to build?"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)(e);
                            }
                        }}
                        />
                    )}
                    /> */}


                {/* <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <TextareaAutosize
                    {...field}
                    value={field.value ?? ""} // ✅ ensure it's never undefined
                    onChange={(e) => field.onChange(e.target.value)} // ✅ pass string not event
                    disabled={isPending}
                    onFocus={() => setIsFocused(true)}
                    onBlur={field.onBlur}
                    minRows={2}
                    className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                    placeholder="What would you like to build?"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)(e);
                        }
                    }}
                    />
                )}
                /> */}


                {/* <FormField
  control={form.control}
  name="value"
  render={({ field }) => (
    <TextareaAutosize
      {...field} // includes ref, name, onBlur, etc.
      value={field.value ?? ""} // ensure defined
      onChange={(e) => {
        field.onChange(e.target.value); // update RHF manually
        console.log("User typing:", e.target.value);
      }}
      disabled={isPending}
      onFocus={() => setIsFocused(true)}
      onBlur={field.onBlur}
      minRows={2}
      className="pt-4 resize-none border-none w-full outline-none bg-transparent"
      placeholder="What would you like to build?"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }
      }}
    />
  )}
/> */}




{/* <TextareaAutosize
  {...form.register("value")}
  onChange={(e) => {
    form.setValue("value", e.target.value);
    console.log("Typing:", e.target.value);
  }}
  minRows={2}
  className="pt-4 resize-none border-none w-full outline-none bg-transparent"
  placeholder="What would you like to build?"
/> */}

{/* TESTING PURE HTML TEXTAREA */}
{/* <textarea
  onChange={(e) => {
    console.log("Typing:", e.target.value);
  }}
  placeholder="Test typing here"
  className="border p-2 w-full bg-white text-black"
  rows={4}
/> */}



{/* below temporary text code worked for typing not enabled issue it happened because some parent component was inferencing with rendeing of this  */}
{/* <textarea
  onChange={(e) => console.log("Typing:", e.target.value)}
  placeholder="Test typing here"
  className="border p-2 w-full bg-white text-black relative z-50 pointer-events-auto"
  rows={4}
/> */}


<FormField
  control={form.control}
  name="value"
  render={({ field }) => (
    <TextareaAutosize
      {...field}
      value={field.value ?? ""} // avoid undefined
    //   onChange={(e) => field.onChange(e.target.value)} // update RHF value
    onChange={(e) => {
  field.onChange(e.target.value);
  console.log("RHF value updating to:", e.target.value);
}}


      disabled={isPending}
      onFocus={() => setIsFocused(true)}
      onBlur={field.onBlur}
      minRows={2}
      className="pt-4 resize-none border-none w-full outline-none bg-transparent relative z-50 pointer-events-auto"
      placeholder="What would you like to build?"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }
      }}
    />
  )}
/>

















                <div className="flex gap-x-2 items-end justify-between pt-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded">
                        <span>&#8984;</span>Enter
                        </kbd>
                        &nbsp;to submit

                    </div>

                    {/* here the below button is a whatsapp style send button
                 */}

                    <Button
                    type="submit"
                    disabled={isButtonDisabled}
                    className={cn(
                        "size-8 rounded-full",
                        isButtonDisabled && "bg-muted-foreground border"
                    )}>

                        {isPending ? (
                            <Loader2Icon className="size-4 animate-spin"/>
                        ) :(
                            <ArrowUpIcon/>
                        )}

                    </Button>

                </div>

            </form>


        </Form>

        </div>
    )



    
}