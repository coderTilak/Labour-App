"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { removeAuthToken } from '@/utils/api';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    removeAuthToken();
    router.push('/login');
  };

  return (
    <button 
      onClick={handleSignOut}
      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-3"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
      </svg>
      Sign Out
    </button>
  );
}
