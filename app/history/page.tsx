'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import SiteNav from '@/components/SiteNav';
import StarryBackground from '@/components/StarryBackground';
import { getHistory, deleteEntry, HistoryEntry } from '@/lib/history';

const MODEL_COLORS = ['#FF5A70', '#FFD36A', '#61D99B', '#62A8FF'];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知时间';
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function handoffToHome(entry: HistoryEntry, mode: 'revisit' | 'reanalyze') {
  sessionStorage.setItem(mode === 'revisit' ? 'prism-revisit-entry' : 'prism-reanalyze-entry', JSON.stringify(entry));
  window.location.href = '/';
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const history = getHistory();
    setEntries(history);
    setExpandedId(history[0]?.id || null);
  }, []);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setExpandedId((prev) => (prev === id ? null : prev));
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <StarryBackground />
      <SiteNav />

      <section className="page-shell max-w-4xl">
        <Link href="/" className="text-sm text-white/36 transition-colors hover:text-white/72">返回分析</Link>
        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">HISTORY</p>
            <h1 className="page-title">历史记录</h1>
            <p className="page-copy">每一束穿过棱镜的光，都留下了一道可以再次观察的痕迹。</p>
          </div>
          <div className="premium-panel shrink-0 px-5 py-4">
            <p className="font-mono text-[10px] tracking-[0.18em] text-white/20">TOTAL</p>
            <p className="mt-1 text-2xl font-light text-white/72">{entries.length}</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="premium-panel mt-14 p-12 text-center">
            <p className="text-sm text-white/34">还没有记录。</p>
            <p className="mt-2 text-[11px] text-white/18">返回首页开始第一次分析。</p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {entries.map((entry) => {
              const models = Array.isArray(entry.result?.models) ? entry.result.models : [];
              const version = entry.result?.version || 1;
              const expanded = expandedId === entry.id;

              return (
                <article key={entry.id} className="premium-panel group p-5 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <button type="button" onClick={() => setExpandedId(expanded ? null : entry.id)} className="min-w-0 flex-1 text-left">
                      <p className="font-mono text-xs tracking-[0.12em] text-white/22">
                        {formatDate(entry.createdAt)}
                        {version > 1 && <span className="ml-3 text-white/14">#{version}</span>}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/56">{entry.input || '未命名事件'}</p>

                      {models.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {models.slice(0, expanded ? models.length : 4).map((m, i) => {
                            const name = String(m?.name || '未命名视角');
                            const color = MODEL_COLORS[i % MODEL_COLORS.length];
                            return (
                              <span key={`${entry.id}-${name}-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/34">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}66` }} />
                                {name.length > 12 ? name.slice(0, 12) + '…' : name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </button>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                      <button type="button" onClick={() => setExpandedId(expanded ? null : entry.id)} className="analysis-ghost-button">
                        {expanded ? '收起' : '展开'}
                      </button>
                      <button type="button" onClick={() => handoffToHome(entry, 'revisit')} className="analysis-ghost-button">再看一次</button>
                      <button type="button" onClick={() => handoffToHome(entry, 'reanalyze')} className="analysis-ghost-button">再解释一次</button>
                      <button type="button" onClick={() => handleDelete(entry.id)} className="analysis-ghost-button text-white/18 hover:text-white/46">删除</button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded && models.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 border-t border-white/[0.05] pt-4">
                          <p className="mb-3 text-[10px] font-mono tracking-[0.18em] text-white/16">解释模型</p>
                          <div className="grid gap-3">
                            {models.map((model, index) => {
                              const color = MODEL_COLORS[index % MODEL_COLORS.length];
                              return (
                                <div key={`${entry.id}-detail-${index}`} className="rounded-[14px] border border-white/[0.055] bg-white/[0.018] p-3">
                                  <p className="flex items-center gap-2 text-sm text-white/62">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}66` }} />
                                    {model.name || '未命名视角'}
                                  </p>
                                  {(model.content || model.logic || model.explanation) && (
                                    <p className="mt-2 text-xs leading-6 text-white/34">{model.content || model.logic || model.explanation}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}

        <p className="mx-auto mt-14 max-w-xl bg-gradient-to-r from-white/40 via-[#dfe9ff]/70 to-[#f1d7ff]/44 bg-clip-text text-center text-sm leading-8 tracking-[0.08em] text-transparent drop-shadow-[0_0_18px_rgba(180,205,255,0.18)]">
          或许这世界一直在试图解释你。<br />
          但没有一种解释，能代表全部的你。
        </p>
      </section>
    </main>
  );
}