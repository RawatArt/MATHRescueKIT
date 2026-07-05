import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Part } from '../types';
import renderMathInElement from 'katex/contrib/auto-render';

interface PartModalProps {
  part: Part;
  onClose: () => void;
}

export function PartModal({ part, onClose }: PartModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // ใช้ onLayoutAnimationComplete เพื่อแสดงเนื้อหาแทนการใช้ setTimeout 
    // เพื่อรับประกันว่าเนื้อหาจะโผล่มาตอนแอนิเมชันหยุดสนิทพอดีเป๊ะ
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showContent && contentRef.current) {
      // เมื่อ DOM วาดเสร็จแล้ว ให้หน่วงเวลาอีกนิดก่อนประมวลผลคณิตศาสตร์
      timer = setTimeout(() => {
        renderMathInElement(contentRef.current!, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }, 50);
    }
    return () => clearTimeout(timer);
  }, [showContent, part.gridHTML]);

  const handleClose = () => {
    // ซ่อนเนื้อหาหนักๆ ทิ้งทันที เพื่อให้แอนิเมชันหุบกลับทำได้ลื่นไหล
    setShowContent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0"
        style={{ background: 'rgba(10,9,8,.8)' }}
      />

      {/* Light Panel */}
      <motion.div
        layoutId={`part-${part.id}`}
        transition={{ type: 'spring', stiffness: 300, damping: 33, mass: 0.9 }}
        onLayoutAnimationComplete={() => setShowContent(true)}
        className="relative min-h-screen w-full bg-light"
        style={{ background: 'radial-gradient(140% 90% at 50% -5%, #fff, #f7f7fb 66%)' }}
      >
        {/* Top sticky bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <button
              onClick={handleClose}
              className="text-mono text-sm font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-2"
            >
              ← กลับไปเลือกบท
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <h3 className="font-bold text-lg text-gray-900">
              {part.num} · {part.name} <span className="text-gray-500 font-normal text-base ml-2">{part.th}</span>
            </h3>
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--concept)' }}></span>Concept</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--formula)' }}></span>Formula</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--trigger)' }}></span>Trigger</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--mistake)' }}></span>Mistake</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--tip)' }}></span>Tip</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--hack)' }}></span>Hack</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-12">
          {/* The flex grid container for cards */}
          {showContent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              ref={contentRef}
              className="flex flex-wrap gap-7 justify-center"
              dangerouslySetInnerHTML={{ __html: part.gridHTML }}
            />
          ) : (
            <div className="flex flex-wrap gap-7 justify-center min-h-[50vh]" />
          )}
        </div>
      </motion.div>
    </div>
  );
}
