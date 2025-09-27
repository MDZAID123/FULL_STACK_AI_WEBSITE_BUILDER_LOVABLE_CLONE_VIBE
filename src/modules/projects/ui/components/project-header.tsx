
import { ChevronLeftIcon, SunMoonIcon } from "lucide-react";
import { Chevron } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

interface Props{
    projectId:string;
}



export const ProjectHeader=({projectId}:Props)=>{

    const trpc=useTRPC();

    const {data:project}=useSuspenseQuery(
        trpc.projects.getOne.queryOptions({id:projectId})
    );


    const {setTheme,theme}=useTheme();
    //from next themes let us switch between light and dark 
    //system in the dropdown



    return (
        <header className="p-2 flex justify-between items-center border-b">
            <DropdownMenu>
                <DropdownMenuTrigger aschild>
                    <Button
                    variant="ghost"
                    size="sm"
                    classname="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity  plz-2!">
                        <Image
                        src="/logo.svg" alt="Vibe" width={18} height={18}/>
                        <span className="text-sm font-medium">{project.name}</span>
                        <ChevronDownIcon/>


                    </Button>

                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                    <DropdownMenuItem aschild>
                        <Link href="/">
                        <ChevronLeftIcon/>
                        <span>
                            Go to Dashboard
                        </span>
                        </Link>
                        

                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2">
                            <SunMoonIcon className="size-4 text-muted-foreground"/>
                            <span>Appearance</span>

                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                                    <DropdownMenuRadioItem value="light">
                                        <span>Light</span>
                                    </DropdownMenuRadioItem>

                                    <DropdownMenuRadioItem value="dark">
                                        <span>Dark</span>

                                    </DropdownMenuRadioItem>

                                    <DropdownMenuRadioItem value="system">
                                        <span>System</span>

                                    </DropdownMenuRadioItem>


                                </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                </DropdownMenuContent>
            </DropdownMenu>

        </header>
    )

}