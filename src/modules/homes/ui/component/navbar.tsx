"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

//This is the top navbar of the page 

//Always stays at the top of the page (fiex top -0 left-o right -0 z-50)
//changes background style when you scroll (usescroll() hook)
//show diff options depending on whether the user is signed in or signed out 


export const Navbar=()=>{

    const isScrolled=useScroll();


    return (
        <nav className={cn(
            "p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
            isScrolled && "bg-background border-border"
        )}>

            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                {/* inner container keep navbar content centerd and restricted width  */
                }
                <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Vibe" width={24} height={24}/>
                <span className="font-semibold text-lg">Vibe</span>
                </Link>
                <SignedOut>
                    <div className="flex gap-2">
                        <SignUpButton>
                            <Button variant="outline" size="sm">
                                Sign up

                            </Button>
                        </SignUpButton>

                        <SignInButton>
                            <Button size="sm">
                                Sign in

                            </Button>


                        </SignInButton>

                    </div>
                </SignedOut>
                <SignedIn>

                    <UserControl showName/>

                </SignedIn>

            </div>

        </nav>
    )



}