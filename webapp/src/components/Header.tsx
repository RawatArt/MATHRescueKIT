import React from 'react';

export function Header() {
  return (
    <header className="mb-12">
      {/* Hazard stripe bar */}
      <div className="h-2 w-full bg-hazard mb-8"></div>
      
      <div className="container mx-auto px-6">
        <h1 className="text-mono uppercase text-amber tracking-widest leading-none" 
            style={{ fontSize: 'clamp(30px, 7vw, 54px)', letterSpacing: '0.02em' }}>
          Math Rescue Kit
        </h1>
        <p className="text-mute mt-2 text-sm max-w-xl font-body">
          ระบบกู้ภัยคณิตศาสตร์ ม.ปลาย — เนื้อหาลัดสำหรับอ่านก่อนสอบ 10 นาที
        </p>
      </div>
    </header>
  );
}
