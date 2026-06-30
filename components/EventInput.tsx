'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const EXAMPLES = [
  { text: '一件你无法确定原因的事情', color: '#FF5A70' },
  { text: '一个你不知道该怎么理解的情况', color: '#FFD36A' },
  { text: '一个让你反复困惑的经历片段', color: '#61D99B' },
  { text: '一个你无法判断对错的局面', color: '#62A8FF' },
];

const STAGES = [
  { label: '想一想当时', hint: '只要一个让你困惑的瞬间。' },
  { label: '把细节写下来', hint: '当时发生了什么，你感受到什么。' },
  { label: '准备拆解', hint: '我们会保留不确定性，而不是急着下结论。' },
];

interface EventInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  collapsed?: boolean;
  offset?: { x: number; y: number; w: number; h: number };
  onDraftChange?: (input: string) => void;
}

export default function EventInput({ onSubmit, isLoading, offset, onDraftChange }: EventInputProps) {
  const [input, setInput] = useState('');
  const progress = Math.min(1, input.trim().length / 180);
  const stage = useMemo(() => {
    if (progress < 0.24) return STAGES[0];
    if (progress < 0.64) return STAGES[1];
    return STAGES[2];
  }, [progress]);

  const handleInputChange = (value: string) => {
    setInput(value);
    onDraftChange?.(value);
  };

  const handleSubmit = () => {
    if (input.trim().length >= 2 && !isLoading) onSubmit(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 15,
        left: offset?.x ?? 0,
        top: offset?.y ?? 0,
        width: offset?.w ?? 760,
        minHeight: offset?.h ?? 260,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-44 left-0 w-[min(94vw,760px)] text-left"
      >
        <p className="mb-3 text-[10px] font-mono tracking-[0.24em] text-white/16">重新看清正在困扰你的事</p>
        <h1 className="text-3xl font-serif font-semibold leading-tight text-white/88 sm:text-[3.2rem]">
          让你看清正在困扰你的事情
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/48 sm:text-base">
          输入一件让你困惑的事，拆成 事实 / 多种解释 / 下一步验证
        </p>
      </motion.div>

      <motion.div
        id="event-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.56, delay: 0.28 }}
        className="relative overflow-hidden rounded-[26px] p-2.5"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035) 40%, rgba(8,12,28,0.62)), rgba(7,12,28,0.74)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 34px 110px rgba(0,0,0,0.48), 0 0 0 1px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.14)',
          backdropFilter: 'blur(24px) saturate(128%)',
          WebkitBackdropFilter: 'blur(24px) saturate(128%)',
        }}
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

        <div className="relative rounded-[20px] border border-white/[0.09] bg-white/[0.03] px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between gap-4">
            <span className="text-xs tracking-[0.16em] text-white/28">{stage.label}</span>
            <span className="hidden text-xs text-white/16 sm:inline">{stage.hint}</span>
          </div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="写下一件你最近想不清楚的事情…"
              className="relative z-[1] w-full min-h-[100px] resize-none rounded-[14px] border border-white/[0.08] bg-transparent px-4 py-3 text-base leading-7 text-white/84 placeholder:text-white/28 transition-colors focus:border-white/14 focus:outline-none"
              style={{ caretColor: 'rgba(226, 232, 240, 0.92)' }}
              maxLength={2000}
              disabled={isLoading}
            />
            <span className="absolute right-3 bottom-2 z-10 text-[10px] font-mono text-white/14">{input.length}/2000</span>
          </div>
        </div>

        <div className="relative mt-2 flex justify-end px-1">
          <motion.button
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={input.trim().length < 2 || isLoading}
            className="rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {isLoading ? '折射中...' : '帮我拆解这件事'}
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, delay: 0.5 }}
        className="mt-3 max-w-[760px] mx-auto"
      >
        <p className="mb-2 text-[11px] text-white/16 tracking-[0.16em]">试试看</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EXAMPLES.map((example) => (
            <button
              key={example.text}
              onClick={() => handleInputChange(example.text)}
              disabled={isLoading}
              className="group relative min-h-[74px] overflow-hidden rounded-[16px] p-4 text-left transition-all duration-300 disabled:opacity-25 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.028)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <span className="absolute inset-x-4 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${example.color}66, transparent)` }} />
              <span className="mb-3 block h-2 w-2 rounded-full opacity-82" style={{ background: example.color, boxShadow: `0 0 12px 2px ${example.color}55` }} />
              <span className="block text-xs leading-5 text-white/52 transition-colors duration-500 group-hover:text-white/82">{example.text}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
