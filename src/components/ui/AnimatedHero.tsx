'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useMotionTemplate, 
  useAnimationFrame,
  AnimatePresence,
} from 'framer-motion';
import Button from './Button';

interface Hotspot {
  id: number;
  x: number;
  y: number;
  size: 'sm' | 'md' | 'lg';
  delay: number;
}

const generateHotspots = (count: number): Hotspot[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: ['sm', 'md', 'lg'][Math.floor(Math.random() * 3)] as 'sm' | 'md' | 'lg',
    delay: Math.random() * 3,
  }));
};

const HotspotDot = ({ hotspot }: { hotspot: Hotspot }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  const glowSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className="absolute"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: hotspot.delay,
        ease: 'easeOut',
      }}
    >
      {/* Glow ring */}
      <motion.div
        className={cn(
          'absolute -translate-x-1/2 -translate-y-1/2 rounded-full',
          glowSizes[hotspot.size],
          'bg-brand-500/20'
        )}
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{ 
          duration: 2 + hotspot.delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Core dot */}
      <motion.div
        className={cn(
          'absolute -translate-x-1/2 -translate-y-1/2 rounded-full',
          sizeClasses[hotspot.size],
          'bg-brand-500 shadow-glow-brand'
        )}
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: hotspot.delay * 0.5,
        }}
      />
    </motion.div>
  );
};

const MapGridPattern = ({ offsetX, offsetY }: { offsetX: any; offsetY: any }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="map-grid-pattern"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          {/* Main grid lines */}
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-brand-600/30"
          />
          {/* Secondary grid lines */}
          <path
            d="M 30 0 L 30 60 M 0 30 L 60 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-brand-600/15"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#map-grid-pattern)" />
    </svg>
  );
};

export default function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const hotspots = useMemo(() => generateHotspots(15), []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.3) % 60);
    gridOffsetY.set((gridOffsetY.get() + 0.15) % 60);
  });

  const spotlightSize = 400;
  const maskImage = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 70%)`;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-stone-50"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-stone-50 to-moss-50" />
      
      {/* Subtle static grid */}
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <MapGridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>
      
      {/* Interactive spotlight grid */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-50 hidden md:block"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <MapGridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      {/* Animated hotspot markers */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence>
          {isVisible && hotspots.map((hotspot) => (
            <HotspotDot key={hotspot.id} hotspot={hotspot} />
          ))}
        </AnimatePresence>
      </div>

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          className="absolute right-[-10%] top-[-10%] w-[50%] h-[50%] rounded-full bg-brand-400/20 blur-[120px]"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute left-[-15%] bottom-[-20%] w-[45%] h-[45%] rounded-full bg-moss-400/15 blur-[100px]"
          animate={{ 
            scale: [1, 1.15, 1],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute right-[20%] bottom-[10%] w-[25%] h-[25%] rounded-full bg-sunlight-300/20 blur-[80px]"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-brand-600 rounded-full px-5 py-2.5 text-sm font-medium border border-brand-100 shadow-soft">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            Active across the UK
          </span>
        </motion.div>
        
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-loam tracking-tight leading-[1.05]"
        >
          Care for your{' '}
          <span className="text-brand-500 relative">
            corner
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              style={{ originX: 0 }}
            />
          </span>
          <span className="text-brand-500">.</span>
        </motion.h1>
        
        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl lg:text-2xl text-weathered mt-6 max-w-2xl leading-relaxed"
        >
          Report rubbish, find local hotspots, and join picks near you. 
          A simpler way to look after where you live.
        </motion.p>
        
        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <a href="/report">
            <Button size="lg" className="shadow-soft-lg min-w-[180px]">
              Report litter
            </Button>
          </a>
          <a href="/picks">
            <Button size="lg" variant="outline" className="min-w-[180px]">
              I want to help
            </Button>
          </a>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-stone-400"
          >
            <span className="text-xs font-medium tracking-wide uppercase">Scroll</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
