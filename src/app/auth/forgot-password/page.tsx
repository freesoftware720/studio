
"use client";

import { ForgotPasswordForm } from '@/components/feature/auth/forgot-password-form';
import { KeyRound } from 'lucide-react';
import { AuthFormWrapper } from '@/components/feature/auth/auth-form-wrapper';

export default function ForgotPasswordPage() {
  return (
    <AuthFormWrapper title="Reset Your Password" icon={KeyRound}>
      <ForgotPasswordForm />
    </AuthFormWrapper>
  );
}
