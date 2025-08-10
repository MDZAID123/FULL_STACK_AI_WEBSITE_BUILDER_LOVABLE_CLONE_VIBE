"use client"; 
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react'

import { useTRPC } from '@/trpc/client';

export const Client  = () => {
    const trpc=useTRPC();
    const {data}=useSuspenseQuery(trpc.createAI.queryOptions({ text: "Antonio PREFETCH" }));
  return (
    <div>
        {JSON.stringify(data)}
    </div>
  )
}

