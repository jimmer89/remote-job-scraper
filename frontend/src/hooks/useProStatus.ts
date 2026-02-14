'use client';

import { useSession } from 'next-auth/react';

export const FREE_JOB_LIMIT = 1;

export function useProStatus() {
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isPro = isAuthenticated && (session?.user as any)?.isPro === true;
  
  return {
    isLoading,
    isAuthenticated,
    isPro,
    isFree: isAuthenticated && !isPro,
    isAnonymous: !isAuthenticated,
    user: session?.user,
    jobLimit: isPro ? Infinity : FREE_JOB_LIMIT,
  };
}
