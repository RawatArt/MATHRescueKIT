import React from 'react';

export function Footer() {
  return (
    <footer className="container mx-auto px-6 py-12 mt-12 border-t border-edge">
      <div className="flex flex-col items-center justify-center text-center gap-6">
        
        <div>
          <p className="text-mute font-body text-sm mb-1">
            พร้อมเรียนรู้อย่างเต็มระบบ
          </p>
          <p className="text-mute font-body text-sm mb-1">
            หากต้องการเนื้อหาฉบับเต็มและแนวข้อสอบครบทุกบท
          </p>
          <p className="text-amber font-body text-sm">
            สามารถติดตามและสอบถามรายละเอียดได้ที่
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <a 
            href="https://line.me/ti/p/~artrawat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-panel2 rounded-xl border border-edge hover:bg-steel transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#06C755">
              <path d="M22.5 10.5C22.5 5.8 17.8 2 12 2C6.2 2 1.5 5.8 1.5 10.5C1.5 14.2 4.1 17.5 8 18.6C8.3 18.7 8.5 18.9 8.5 19.2C8.5 19.2 8.4 20 8.3 20.3C8.1 21 8 21 8.5 21.2C9.1 21.6 12 19.8 13.6 18.8C14.1 18.5 14.6 18.2 15.2 17.9C19.7 16.2 22.5 13.5 22.5 10.5ZM9.8 12.8H7.9C7.6 12.8 7.3 12.5 7.3 12.2V8.2C7.3 7.9 7.6 7.6 7.9 7.6C8.2 7.6 8.5 7.9 8.5 8.2V11.5H9.8C10.1 11.5 10.4 11.8 10.4 12.1C10.4 12.5 10.1 12.8 9.8 12.8ZM12.2 12.2C12.2 12.5 11.9 12.8 11.6 12.8C11.3 12.8 11 12.5 11 12.2V8.2C11 7.9 11.3 7.6 11.6 7.6C11.9 7.6 12.2 7.9 12.2 8.2V12.2ZM16.4 12.2C16.4 12.5 16.1 12.8 15.8 12.8C15.5 12.8 15.2 12.5 15.2 12.2V9.8L13.8 12.6C13.8 12.7 13.6 12.8 13.5 12.8C13.4 12.8 13.3 12.7 13.2 12.6C13.2 12.6 13.2 12.5 13.2 12.4V8.2C13.2 7.9 13.5 7.6 13.8 7.6C14.1 7.6 14.4 7.9 14.4 8.2V10.7L15.8 7.9C15.8 7.7 16 7.6 16.1 7.6C16.2 7.6 16.3 7.6 16.4 7.7C16.4 7.7 16.4 7.8 16.4 7.9V12.2Z"/>
            </svg>
            <span className="text-ink font-mono text-sm group-hover:text-amber transition-colors">Line: artrawat</span>
          </a>
          
          <a 
            href="https://www.facebook.com/raywatatit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-panel2 rounded-xl border border-edge hover:bg-steel transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.562H7.078V12.073H10.125V9.414C10.125 6.408 11.916 4.755 14.658 4.755C15.972 4.755 17.344 4.99 17.344 4.99V7.937H15.831C14.341 7.937 13.875 8.861 13.875 9.816V12.073H17.203L16.671 15.562H13.875V24C19.612 23.094 24 18.1 24 12.073Z"/>
            </svg>
            <span className="text-ink font-mono text-sm group-hover:text-amber transition-colors">Facebook: Rawat Arthit</span>
          </a>
        </div>
        
      </div>
    </footer>
  );
}
