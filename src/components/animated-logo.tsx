
'use client';

import { useState, useEffect } from 'react';
import { Armchair, BedDouble, Lamp, Sofa, Box } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const icons = [
    { component: Box, key: 'box' },
    { component: Armchair, key: 'armchair' },
    { component: BedDouble, key: 'bed' },
    { component: Lamp, key: 'lamp' },
    { component: Sofa, key: 'sofa' },
];

export function AnimatedLogo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 2000); // Change icon every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  const Icon = icons[index].component;

  return (
    <div className="relative w-8 h-8 flex items-center justify-center text-primary">
        <AnimatePresence mode="wait">
            <motion.div
                key={icons[index].key}
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="absolute"
            >
                <Icon className="w-8 h-8" />
            </motion.div>
        </AnimatePresence>
    </div>
  );
}
