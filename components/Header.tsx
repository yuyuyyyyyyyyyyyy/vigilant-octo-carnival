'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LINES = [
  '把确定感放慢一点',
  '给同一件事多留一个入口',
  '不是判决，是观察',
  '让复杂性先被看见',
  '从另一束光里重新开始',
];

interface HeaderProps {
  minimal?: boolean;
  onClickHome?: () => void;
}

export default function Header({ minimal = false, onClickHome }: HeaderProps) {
  const [line, setLine] = useState('');

  useEffect(() => {
    setLine(LINES[Math.floor(Math.random() * LINES.length)]);
  }, []);

  const goHome = () => {
    if (onClickHome) onClickHome();
    else window.location.href = '/';
  };

  return (
    <header className="relative z-30 flex w-full items-center justify-between px-6 py-6">
      <button type="button" onClick={goHome} aria-label="回到首页" className="group flex items-center gap-3 text-white/58 transition-colors hover:text-white/88">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] shadow-[0_0_30px_rgba(94,168,255,0.08)] transition-all duration-300 group-hover:border-white/18 group-hover:bg-white/[0.045]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l4.2 5.8L22 12l-5.8 4.2L12 22l-4.2-5.8L2 12l5.8-4.2L12 2z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" opacity="0.72" />
            <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="0.55" opacity="0.22" />
          </svg>
        </span>
        {!minimal && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden text-sm font-light tracking-wider text-white/46 sm:inline">
            {line || '...'}
          </motion.span>
        )}
      </button>
    </header>
  );
}
