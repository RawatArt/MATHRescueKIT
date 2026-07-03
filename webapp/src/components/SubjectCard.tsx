import React from 'react';
import { motion } from 'framer-motion';
import { SubjectMeta } from '../types';

interface SubjectCardProps {
  meta: SubjectMeta;
  isReady: boolean;
  totalCards: number;
  totalParts: number;
  onClick: () => void;
}

export function SubjectCard({ meta, isReady, totalCards, totalParts, onClick }: SubjectCardProps) {
  if (!isReady) {
    return (
      <div 
        className="relative flex flex-col justify-between overflow-hidden rounded-[18px] border border-edge p-6"
        style={{ background: 'linear-gradient(180deg, #221e18, #17130f)', minHeight: 200, opacity: 0.55, cursor: 'not-allowed' }}
      >
        {/* Top hazard strip */}
        <div className="absolute top-0 left-0 w-full h-2 bg-hazard opacity-50" />
        
        {/* Rivets */}
        <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-steel shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-steel shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />

        {/* Glyph background */}
        <div 
          className="absolute -bottom-4 -right-4 text-mono font-bold leading-none pointer-events-none"
          style={{ fontSize: 126, color: meta.accent, opacity: 0.07 }}
        >
          {meta.glyph}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
              <span className="text-mono text-[10.5px] uppercase tracking-widest text-gray-500">LOCKED</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <h2 className="text-2xl font-bold text-gray-500">{meta.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{meta.th}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      layoutId={`subject-${meta.id}`}
      transition={{ type: 'spring', stiffness: 300, damping: 33, mass: 0.9 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative flex flex-col justify-between overflow-hidden rounded-[18px] border border-edge p-6 cursor-pointer group"
      style={{ 
        background: 'linear-gradient(180deg, #221e18, #17130f)', 
        minHeight: 200,
        boxShadow: '0 18px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)'
      }}
    >
      {/* Top hazard strip */}
      <div className="absolute top-0 left-0 w-full h-2 bg-hazard" />
      
      {/* Rivets */}
      <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-steel shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
      <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-steel shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />

      {/* Glyph background */}
      <div 
        className="absolute -bottom-4 -right-4 text-mono font-bold leading-none pointer-events-none transition-opacity duration-300 group-hover:opacity-10"
        style={{ fontSize: 126, color: meta.accent, opacity: 0.07 }}
      >
        {meta.glyph}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber shadow-[0_0_8px_var(--amber)]" />
            <span className="text-mono text-[10.5px] uppercase tracking-widest text-amber">READY</span>
          </div>
          <div className="text-xs text-mute font-medium bg-black/40 px-2 py-1 rounded">
            {totalParts} บท / {totalCards} การ์ด
          </div>
        </div>
        
        <div className="mt-auto">
          <h2 className="text-2xl font-bold text-ink">{meta.name}</h2>
          <p className="text-sm text-mute mt-1 mb-4">{meta.th}</p>
          
          <div className="flex items-center text-amber text-sm font-semibold opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            เปิดกล่อง →
          </div>
        </div>
      </div>
    </motion.div>
  );
}
