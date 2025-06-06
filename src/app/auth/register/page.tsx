
"use client";

import { RegisterForm } from '@/components/feature/auth/register-form';
import { UserPlus } from 'lucide-react';
import { AuthFormWrapper } from '@/components/feature/auth/auth-form-wrapper';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/feature/loading-spinner';


export default function RegisterPage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/'); 
      } else {
        setLoadingUser(false);
      }
    };
    checkUser();
  }, [router]);

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner text="Checking session..." size={48} />
      </div>
    );
  }

  return (
    <AuthFormWrapper title="Create your SmartChef Account" icon={UserPlus}>
      <RegisterForm />
    </AuthFormWrapper>
  );
}
