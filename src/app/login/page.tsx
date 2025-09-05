
'use client';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';
import type { authSchema } from '@/components/auth-form';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (data: z.infer<typeof authSchema>) => {
    try {
      await login(data.email, data.password);
      toast({
        title: 'Success!',
        description: "You've been successfully logged in.",
      });
      router.push('/products');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
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
      <AuthForm type="login" onSubmit={handleLogin} onGoogleSignIn={handleGoogleSignIn} />
    </div>
  );
}
