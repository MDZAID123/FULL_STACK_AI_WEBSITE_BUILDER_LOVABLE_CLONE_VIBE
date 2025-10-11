import { useState,useEffect } from "react";


export const useScroll=(threshold=10)=>{

    const [isScrolled,setIsScrolled]=useState(false);


    useEffect(()=>{

        const handleScroll=()=>{
            setIsScrolled(window.scrollY>threshold);
        }

        window.addEventListener("scroll",handleScroll);
        handleScroll();

        return ()=>window.removeEventListener("scroll",handleScroll);
    },[threshold]);


    return isScrolled;
}


//This is a custom React hook useScroll that track whether the user has scrolled past a certain threshold on the page 
