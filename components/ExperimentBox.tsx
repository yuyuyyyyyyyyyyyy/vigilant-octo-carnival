'use client';

import { motion } from 'framer-motion';
import { NextExperiment } from '@/lib/types';

interface ExperimentBoxProps {
  experiment: string | NextExperiment;
}

export default function ExperimentBox({ experiment }: ExperimentBoxProps) {
  if (!experiment) return null;

  const isStructured = typeof experiment === 'object';

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
      className="premium-panel relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/32 to-transparent" />
      <p className="panel-kicker">下一步实验</p>

      {isStructured ? (
        <div className="mt-4 space-y-3">
          {[
            ['目标变量', (experiment as NextExperiment).target_variable],
            ['实验设计', (experiment as NextExperiment).design],
            ['预期变化', (experiment as NextExperiment).expected_change],
            ['判断标准', (experiment as NextExperiment).judgment_criteria],
            ['模型更新', (experiment as NextExperiment).model_update],
          ].map(([label, value], index) => (
            <div key={label} className="rounded-[13px] border border-white/[0.055] bg-white/[0.018] p-3">
              <p className="text-[10px] font-mono tracking-[0.14em] text-white/18">{label}</p>
              <p className="mt-1 text-sm leading-6 text-white/48">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-white/48">{experiment as string}</p>
      )}

      <p className="mt-4 rounded-[13px] border border-emerald-200/[0.08] bg-emerald-200/[0.025] p-3 text-[11px] leading-5 text-white/22">
        这不是结论，而是一个可以观察、修正、再次折射的行动假设。
      </p>
    </motion.section>
  );
}
