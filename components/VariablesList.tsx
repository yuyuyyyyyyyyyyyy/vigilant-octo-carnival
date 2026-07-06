'use client';

import { motion } from 'framer-motion';
import { CategorizedVariables, VariableItem } from '@/lib/types';

interface VariablesListProps {
  variables: string[] | CategorizedVariables | any;
}

const CATEGORY_LABELS: Record<string, string> = {
  temporal: '时间变量',
  environmental: '环境变量',
  interpersonal: '人际变量',
  historical: '历史行为变量',
  cognitive: '认知状态变量',
  external: '外部信息变量',
};
const CATEGORY_ORDER = ['temporal', 'environmental', 'interpersonal', 'historical', 'cognitive', 'external'];
const CATEGORY_COLORS = ['#62A8FF', '#61D99B', '#FFD36A', '#FF5A70', '#A78BFA', '#7DD3FC'];

function isCategorized(v: any): v is CategorizedVariables {
  return v && typeof v === 'object' && !Array.isArray(v);
}

export default function VariablesList({ variables }: VariablesListProps) {
  if (!variables) return null;

  if (Array.isArray(variables)) {
    if (variables.length === 0) return null;
    return (
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="premium-panel p-5"
      >
        <p className="panel-kicker">关键变量</p>
        <ul className="mt-4 grid gap-2">
          {variables.map((v: string, i: number) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.62 + i * 0.05 }}
              className="rounded-[12px] border border-white/[0.055] bg-white/[0.02] px-3 py-2 text-sm leading-6 text-white/48"
            >
              {v}
            </motion.li>
          ))}
        </ul>
      </motion.section>
    );
  }

  if (isCategorized(variables)) {
    const hasAny = CATEGORY_ORDER.some(cat => {
      const items = (variables as any)[cat] as VariableItem[] | undefined;
      return items && items.length > 0;
    });
    if (!hasAny) return null;
    return (
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="premium-panel p-5"
      >
        <p className="panel-kicker">关键变量系统</p>
        <div className="mt-4 space-y-4">
          {CATEGORY_ORDER.map((cat, catIndex) => {
            const items = (variables as any)[cat] as VariableItem[] | undefined;
            if (!items || items.length === 0) return null;
            const color = CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length];
            return (
              <div key={cat} className="rounded-[14px] border border-white/[0.055] bg-white/[0.018] p-4">
                <p className="mb-3 flex items-center gap-2 text-[10px] font-mono tracking-[0.14em] text-white/24">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
                  {CATEGORY_LABELS[cat]}
                </p>
                {items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.62 + i * 0.03 }}
                    className="mb-2 border-l border-white/[0.07] pl-3 text-sm leading-6 text-white/46 last:mb-0"
                  >
                    {item.variable}
                    {item.impact && (
                      <span className="mt-0.5 block text-[11px] leading-5 text-white/22">{item.impact}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>
      </motion.section>
    );
  }

  return null;
}
