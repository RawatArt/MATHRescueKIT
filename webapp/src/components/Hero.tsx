import React from 'react';

const HERO_DATA = {
  badge: "RA",
  title: "Math Rescue Kit — สรุปคณิตฉบับกู้ภัยก่อนสอบ"
};

export function Hero() {
  return (
    <div className="container mx-auto px-6 mb-12">
      <div className="flex items-center gap-5">
        <div 
          className="rounded-full flex items-center justify-center shrink-0 border border-edge overflow-hidden"
          style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(255,255,255,0.22)',
          }}
        >
          <img src="/logo.png" alt="Math Rescue Kit Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold font-mono text-ink">
            {HERO_DATA.title}
          </h2>
          {/* TODO: เพิ่ม bio 1 บรรทัด */}
        </div>
      </div>
    </div>
  );
}
