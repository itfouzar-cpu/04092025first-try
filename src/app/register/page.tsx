
'use client';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';
import type { authSchema } from '@/components/auth-form';

export default function RegisterPage() {
  const { register } = useAuth();
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
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
      <AuthForm type="register" onSubmit={handleRegister} />
    </div>
  );
}
