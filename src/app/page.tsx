
'use client';

import { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;
    
    const x = (clientX - offsetWidth / 2) / (offsetWidth / 2);
    const y = (clientY - offsetHeight / 2) / (offsetHeight / 2);

    setRotate({ x: -y * 10, y: x * 10 }); // Multiplied for a more noticeable effect
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ perspective: '1000px' }}
    >
      <div className="absolute inset-0 w-full h-full bg-animated-gradient z-0"></div>
      
      <div 
        className="relative z-10 flex flex-col items-center justify-center text-center text-white p-6 max-w-4xl mx-auto transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg font-headline">
          The Future of Home Design is Here
        </h1>
        <p className="mt-6 text-lg md:text-xl leading-relaxed max-w-2xl drop-shadow-md">
          Stop guessing. Start seeing. FouzXR bridges the gap between imagination and reality. Our revolutionary AR technology lets you place true-to-scale 3D models of furniture and decor directly in your own space. Craft your perfect, cozy home with confidence before you buy.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/products">
              <Button size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground border-primary-foreground/50 border">
                  Explore The Collection
                  <ArrowRight className="ml-2"/>
              </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
