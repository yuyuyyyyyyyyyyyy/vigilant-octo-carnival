'use client';

import { motion } from 'framer-motion';
import { InterpretationModel } from '@/lib/types';

interface ModelCardProps {
  model: InterpretationModel;
  index: number;
  mode?: 'explore' | 'converge';
}

const STRIP_COLORS = ['#FF5A70', '#FFD36A', '#61D99B', '#62A8FF'];

function DetailBlock({ label, children }: { label: string; children?: string }) {
  if (!children) return null;
  return (
    <div className="rounded-[14px] border border-white/[0.055] bg-white/[0.018] p-3">
      <p className="text-[10px] font-mono tracking-[0.16em] text-white/18">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/38">{children}</p>
    </div>
  );
}

export default function ModelCard({ model, index, mode }: ModelCardProps) {
  const color = STRIP_COLORS[index % STRIP_COLORS.length];
  const content = model.content || model.logic || model.explanation || '';
  const score = typeof model.score === 'number' ? Math.max(1, Math.min(5, model.score)) : 3;
  const hasStructuredDetails = Boolean(model.fact || model.inference || model.why || model.validation || model.falsification || model.limitation || model.evidence_quote);
  const hasNewFields = Boolean(model.mechanism || model.difference_from_others);
  const isConverge = mode === 'converge';

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, delay: 0.16 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[18px] border border-white/[0.075] bg-white/[0.026] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] transition-all duration-300 hover:border-white/[0.13] hover:bg-white/[0.038] sm:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${color}99, transparent)` }} />
      <div className="absolute -left-20 top-0 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: `${color}18` }} />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-white/22">
            <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
            解释 {String(index + 1).padStart(2, '0')}
            {isConverge && (
              <span className="ml-1 rounded-full border border-indigo-400/20 bg-indigo-400/[0.06] px-1.5 py-0.5 text-[8px] tracking-[0.1em] text-indigo-300/50">最优</span>
            )}
          </p>
          <h3 className="mt-2 text-lg font-normal leading-snug text-white/82">{model.name}</h3>
          {(model.approach || model.dimension) && (
            <p className="mt-1 text-[11px] leading-5 text-white/32">{model.dimension || model.approach}</p>
          )}
        </div>
        <div className="shrink-0 rounded-full border border-white/[0.07] bg-black/16 px-3 py-1.5 text-[10px] font-mono tracking-[0.14em] text-white/38">
          解释力 {score}/5
        </div>
      </div>

      <p className="relative mt-5 text-sm leading-7 text-white/56">{content}</p>

      {hasNewFields && (
        <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
          <DetailBlock label="机制" >{model.mechanism}</DetailBlock>
          <DetailBlock label="与其他模型的区别" >{model.difference_from_others}</DetailBlock>
        </div>
      )}

      {model.evidence_quote && (
        <p className="relative mt-4 border-l border-white/[0.12] pl-3 text-xs leading-6 text-white/34">
          输入依据：{model.evidence_quote}
        </p>
      )}

      {hasStructuredDetails && (
        <div className="relative mt-5 grid gap-2 sm:grid-cols-2">
          <DetailBlock label="事实" >{model.fact}</DetailBlock>
          <DetailBlock label="推测" >{model.inference}</DetailBlock>
          <DetailBlock label="为什么" >{model.why}</DetailBlock>
          <DetailBlock label="如何验证" >{model.validation}</DetailBlock>
          <DetailBlock label="不成立时" >{model.falsification}</DetailBlock>
          <DetailBlock label="模型局限" >{model.limitation}</DetailBlock>
        </div>
      )}

      <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 20}%` }}
          transition={{ duration: 0.8, delay: 0.34 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}55, ${color})` }}
        />
      </div>

      {model.scope && !model.limitation && (
        <p className="relative mt-4 border-t border-white/[0.055] pt-4 text-[11px] leading-5 text-white/24">
          适用范围：{model.scope}
        </p>
      )}
    </motion.article>
  );
}