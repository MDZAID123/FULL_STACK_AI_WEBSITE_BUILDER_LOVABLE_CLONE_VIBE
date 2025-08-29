interface Props{
    params:Promise<{
        projectId:string;
    }>
};

import React from 'react'

const page =async ({params}:Props) => {
  return (
    <div>page</div>
  )
}

export default page