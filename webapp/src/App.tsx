import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { SubjectCard } from './components/SubjectCard';
import { SubjectModal } from './components/SubjectModal';
import { PartModal } from './components/PartModal';
import { Subject, SubjectMeta, Part } from './types';
import registry from './data/registry.json';

import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [subjectsData, setSubjectsData] = useState<Record<string, Subject>>({});
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  useEffect(() => {
    // Dynamically load JSON data from data/ folder
    const loadData = async () => {
      const data: Record<string, Subject> = {};
      for (const meta of registry) {
        try {
          const mod = await import(`../../data/${meta.id}.json`);
          data[meta.id] = mod.default || mod;
        } catch (e) {
          console.log(`Subject ${meta.id} is not yet available.`);
        }
      }
      setSubjectsData(data);
    };
    loadData();
  }, []);

  // Scroll lock and Esc handling
  useEffect(() => {
    if (selectedSubject || selectedPart) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPart) {
          setSelectedPart(null);
        } else if (selectedSubject) {
          setSelectedSubject(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedSubject, selectedPart]);

  return (
    <div className="min-h-screen py-12 flex flex-col">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-6 flex-grow">
        <div 
          className="grid gap-[18px]"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))' }}
        >
          {registry.map((meta: SubjectMeta) => {
            const subject = subjectsData[meta.id];
            const isReady = !!subject;
            
            return (
              <SubjectCard 
                key={meta.id}
                meta={meta}
                isReady={isReady}
                totalParts={isReady ? subject.parts.length : 0}
                totalCards={isReady ? subject.parts.reduce((acc, part) => acc + part.cardCount, 0) : 0}
                onClick={() => {
                  if (isReady) setSelectedSubject(subject);
                }}
              />
            );
          })}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedSubject && (
          <SubjectModal 
            key="subject-modal"
            subject={selectedSubject} 
            onClose={() => setSelectedSubject(null)}
            onSelectPart={(part) => setSelectedPart(part)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPart && (
          <PartModal 
            key="part-modal"
            part={selectedPart}
            onClose={() => setSelectedPart(null)}
          />
        )}
      </AnimatePresence>

      <Analytics />
    </div>
  );
}
