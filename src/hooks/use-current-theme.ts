import { useTheme} from "next-themes";


export const useCurrentTheme=()=>{

    const {theme,systemTheme}=useTheme();


    if(theme === "dark" || theme ==="light"){

        return theme;
    }
    return systemTheme;
}


//This one is related to theme management in a next js project using the next-themes library
