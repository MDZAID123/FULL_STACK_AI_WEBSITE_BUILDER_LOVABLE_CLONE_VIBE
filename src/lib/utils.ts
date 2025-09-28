import { TreeItem } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}





// Seconds util function 
//this is the main logic for converting a list of files into a tree struture 
//for our file explorer 
/**
 * Convert a record of files to a tree structure.
 * @param files - Record of file paths to content
 * @returns Tree structure for TreeView component
 *
 * @example
 * Input: { "src/Button.tsx": "...", "README.md": "..." }
 * Output: [["src", "Button.tsx"], "README.md"]
 */


export function convertFilesToTreeItems(
  files:Record<string,string>
):TreeItem[]{


  //step1 build a raw tree object



  //Define proper type for tree struture 

  interface TreeNode{
    [key:string]:TreeNode|null;
  }

  //Build a tree struture first 
  const tree: TreeNode={};

  //sort files to ensure consistent ordering 
  const sortedPaths=Object.keys(files).sort();


  for (const filePath of sortedPaths){
    const parts=filePath.split("/");
    let current=tree;

    //navigate and create the tree struture 

    for(let i=0 ;i<parts.length-1;i++){
      const part=parts[i];
      if(!current[part]){
        current[part]={};
      }
      current=current[part];
    }
    //add the file leaf node 
    const fileName=parts[parts.length-1];
    current[fileName]=null;//null indicates its a file 
  }


  //Convert tree struture to TreeItem format

  //step2 convert raw tree into treeitem format 


  function convertNode(node:TreeNode,name?:string):TreeItem[]|TreeItem{

    const entries=Object.entries(node);

    if(entries.length === 0){
      return name || "";
    }

    const children:TreeItem[]=[];

    for (const [key,value] of entries){
      if(value === null){
        //it is a file
        children.push(key);
      }else{
        //it is a folder 

        const subTree=convertNode(value,key);

        if(Array.isArray(subTree)){
          children.push([key,...subTree]);
        }else{
          children.push([key,subTree]);
        }
      }
    }
    return children;
  }

  const result=convertNode(tree);
  

  return Array.isArray(result)?result:[result];

}

//visualize step by step how convertFilestotreeItems works 

//step1 input flat file map 
//we start with a flat record of file paths 

// {
//   "src/Button.tsx": "...",
//   "src/utils/helpers.ts": "...",
//   "README.md": "..."
// }


//step2 split file paths ->build raw tree (object)

//each path is split by / nested object 
// {
//   src: {
//     Button.tsx: null,
//     utils: {
//       helpers.ts: null
//     }
//   },
//   README.md: null
// }


//step3 convert to treeItem format 

//now the recursion kicks in 

//if value=null>just return filename 
//if value=object ->return [foldername....,children];


//step4 final result 

// [
//   ["src", 
//     "Button.tsx", 
//     ["utils", "helpers.ts"]
//   ],
//   "README.md"
// ]





