
'use client';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';
import type { authSchema } from '@/components/auth-form';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (data: z.infer<typeof authSchema>) => {
    try {
      await register(data.email, data.password);
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created.',
      });
      router.push('/products');
    } catch (error: any)      {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: 'Success!',
        description: "You've been successfully logged in with Google.",
      });
      router.push('/products');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Google Sign-In Failed',
            description: error.message || 'Could not sign in with Google. Please try again.',
        });
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
      <AuthForm type="register" onSubmit={handleRegister} onGoogleSignIn={handleGoogleSignIn} />
    </div>
  );
}
