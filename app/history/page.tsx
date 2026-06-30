'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
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
              return (
                <article key={entry.id} className="premium-panel group p-5 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs tracking-[0.12em] text-white/22">
                        {formatDate(entry.createdAt)}
                        {version > 1 && <span className="ml-3 text-white/14">#{version}</span>}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/56">{entry.input || '未命名事件'}</p>

                      {models.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {models.map((m, i) => {
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
                    </div>

                    <button onClick={() => handleDelete(entry.id)} className="shrink-0 rounded-full border border-white/[0.06] px-3 py-1.5 text-xs text-white/16 opacity-0 transition-all group-hover:opacity-100 hover:border-white/[0.14] hover:text-white/46">
                      删除
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
