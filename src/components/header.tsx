
'use client';

import Link from 'next/link';
import { AnimatedLogo } from './animated-logo';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';

export function Header() {
  const { user, loading, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <AnimatedLogo />
            <h1 className="text-2xl font-bold text-foreground font-headline">
              FOUZXR
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {!loading &&
            (user ? (
              <>
                <Button onClick={handleLogout} variant="ghost">Logout</Button>
              </>
            ) : (
              <Link href="/login" passHref>
                <Button variant="ghost">Login</Button>
              </Link>
            ))}
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart />
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
        </div>
      </div>
    </header>
  );
}
