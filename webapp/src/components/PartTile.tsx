import React from 'react';
import { motion } from 'framer-motion';
import { Part } from '../types';

interface PartTileProps {
  part: Part;
  onClick: () => void;
}

export function PartTile({ part, onClick }: PartTileProps) {
  return (
    <motion.div
      layoutId={`part-${part.id}`}
      transition={{ type: 'spring', stiffness: 300, damping: 33, mass: 0.9 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative flex items-center overflow-hidden rounded-[14px] cursor-pointer"
      style={{ 
        background: 'linear-gradient(180deg, #2b2620, #201b16)',
        boxShadow: '0 10px 24px rgba(0,0,0,.35)',
        minHeight: 80
      }}
    >
      {/* Left accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[5px]" 
        style={{ 
          backgroundColor: part.accent,
          boxShadow: `0 0 10px ${part.accent}80` 
        }} 
      />
      
      <div className="pl-6 pr-4 py-4 w-full">
        <div className="flex justify-between items-start mb-1">
          <div className="text-mono text-[10.5px] uppercase tracking-wider text-mute">
            {part.num}
          </div>
          <div 
            className="text-xs font-bold px-2 py-0.5 rounded-[4px] text-[#131110]"
            style={{ backgroundColor: part.accent }}
          >
            {part.cardCount} การ์ด
          </div>
        </div>
        <div className="font-bold text-ink leading-snug">{part.name}</div>
        {part.th && <div className="text-sm text-mute mt-1">{part.th}</div>}
      </div>
    </motion.div>
  );
}
