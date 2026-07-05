import React from 'react';
import { motion } from 'framer-motion';
import { Subject, Part } from '../types';
import { PartTile } from './PartTile';

interface SubjectModalProps {
  subject: Subject;
  onClose: () => void;
  onSelectPart: (part: Part) => void;
}

export function SubjectModal({ subject, onClose, onSelectPart }: SubjectModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex p-4 sm:p-8 overflow-y-auto">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0"
        style={{ background: 'rgba(9,8,7,.9)' }}
      />
      
      {/* Modal Panel */}
      <motion.div 
        layoutId={`subject-${subject.id}`}
        transition={{ type: 'spring', stiffness: 300, damping: 33, mass: 0.9 }}
        className="relative w-full max-w-5xl m-auto rounded-[22px] overflow-hidden border border-edge shadow-[0_50px_130px_rgba(0,0,0,.6)]"
        style={{ 
          background: 'var(--panel)',
          // inset clamp
          padding: 'clamp(10px, 3vw, 34px)'
        }}
      >
        {/* Top glow */}
        <div 
          className="absolute top-0 left-0 w-full h-32 pointer-events-none"
          style={{ background: 'radial-gradient(130% 100% at 50% -18%, rgba(245,165,36,.16), transparent 52%)' }}
        />
        
        {/* Top amber line animation */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute top-0 left-0 w-full h-[2px] bg-amber origin-left"
        />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-mono text-amber tracking-widest text-sm mb-2 flex items-center gap-2">
                <span className="text-2xl">{subject.glyph}</span> {subject.id.toUpperCase()}
              </div>
              <h2 className="text-4xl font-bold text-ink" style={{ fontSize: 'clamp(26px, 5vw, 40px)' }}>
                {subject.name}
              </h2>
              <p className="text-mute mt-2">{subject.th}</p>
            </div>
            
            <button 
              onClick={onClose}
              className="text-mono text-sm text-mute hover:text-white transition-colors flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-edge"
            >
              ปิดกล่อง ✕
            </button>
          </div>
          
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {subject.parts.map(part => (
              <PartTile 
                key={part.id} 
                part={part} 
                onClick={() => onSelectPart(part)} 
              />
            ))}
          </div>
          
          <div className="mt-12 pt-6 border-t border-edge flex justify-between items-center">
            <div className="text-mute text-sm">
              บรรจุ {subject.parts.length} บทเรียน
            </div>
            <a 
              href={`/pdf/${
                {
                  calculus: 'CalculusRescueKit.pdf',
                  set: 'SetTheoryRescueKit.pdf',
                  logic: 'TheLogicRescueKit.pdf',
                  real: 'RealNumberPolynomialRescueKit.pdf',
                  func: 'TheFunctionRescueKit.pdf',
                  explog: 'TheExpoLogRescueKit.pdf',
                  trig: 'TrigonometryRescueKit.pdf',
                  analytic: 'AnalyticGeometryConicsRescueKit.pdf',
                  matrix: 'TheMatrixRescueKit.pdf',
                  vector: 'TheVectorRescueKit.pdf',
                  complex: 'ComplexNumberRescueKit.pdf',
                  seq: 'SequenceSeriesRescueKit.pdf',
                  count: 'CountingProbabilityRescueKit.pdf',
                  prob: 'ProbabilityBayesRescueKit.pdf',
                  stat: 'StatisticsRescueKit.pdf'
                }[subject.id]
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-amber/10 text-amber border border-amber/30 rounded-full hover:bg-amber hover:text-black transition-colors font-bold text-sm flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              ดาวน์โหลด PDF
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
