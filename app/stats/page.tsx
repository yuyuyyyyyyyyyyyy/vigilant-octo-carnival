'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TOTAL_URL = 'https://api.countapi.xyz/get/duolengjing/visits';

const PAGE_KEYS = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'method', label: '方法说明', path: '/method' },
  { key: 'examples', label: '样例事件', path: '/examples' },
  { key: 'history', label: '历史记录', path: '/history' },
  { key: 'stats', label: '访问统计', path: '/stats' },
];

interface PageStat {
  label: string;
  path: string;
  count: number;
}

export default function StatsPage() {
  const [total, setTotal] = useState<number | null>(null);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 读取总量
        const totalRes = await fetch(TOTAL_URL);
        const totalData = await totalRes.json();
        setTotal(totalData.value || 0);

        // 读取各页面独立计数
        const pagePromises = PAGE_KEYS.map(async ({ key, label, path }) => {
          try {
            const res = await fetch(`https://api.countapi.xyz/get/duolengjing/${key}`);
            const data = await res.json();
            return { label, path, count: data.value || 0 };
          } catch {
            return { label, path, count: 0 };
          }
        });
        const pageData = await Promise.all(pagePromises);
        setPages(pageData.sort((a, b) => b.count - a.count));
      } catch {
        // 静默失败
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a] text-white">
        <p className="text-white/50">加载中...</p>
      </div>
    );
  }

  const maxCount = Math.max(...pages.map((p) => p.count), 1);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-white/40 hover:text-white/70 transition-colors text-sm">
          &larr; 返回首页
        </Link>
        <span className="text-white/30 text-xs">数据实时更新</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {/* 总访问量 */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white/3 rounded-xl p-6 border border-white/5 text-center">
            <p className="text-sm text-white/30 mb-2">总访问量</p>
            <p className="text-5xl font-bold text-white font-mono">
              {total !== null ? total.toLocaleString() : '—'}
            </p>
          </div>
        </div>

        {/* 各页面访问排行 */}
        <section>
          <h2 className="text-lg font-medium text-white/70 mb-4">页面访问排行</h2>
          <div className="space-y-2">
            {pages.map((page, i) => {
              const pct = total && total > 0 ? Math.round((page.count / total) * 100) : 0;
              return (
                <div key={page.path} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/20 w-5">{i + 1}</span>
                  <span className="text-sm text-white/70 w-20">{page.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500/50 rounded-full transition-all"
                      style={{ width: `${Math.max((page.count / maxCount) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm text-white/50 font-mono w-12 text-right">{page.count}</span>
                  {pct > 0 && (
                    <span className="text-xs text-white/25 w-10 text-right">{pct}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 说明 */}
        <p className="text-center text-white/15 text-xs pt-4">
          每次页面加载自动计数 · 无需注册 · 完全免费
        </p>
      </div>
    </div>
  );
}
