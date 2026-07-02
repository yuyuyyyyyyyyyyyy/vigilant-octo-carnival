'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DayStats {
  date: string;
  total: number;
  pages: Record<string, number>;
}

interface StatsData {
  total: number;
  days: DayStats[];
  today: DayStats | null;
  referrers: [string, number][];
  topPages: [string, number][];
  lastUpdated: string | null;
  message?: string;
}

const PAGE_NAMES: Record<string, string> = {
  '/': '首页',
  '/method': '方法说明',
  '/examples': '样例事件',
  '/history': '历史记录',
  '/stats': '访问统计',
};

function pageName(path: string): string {
  return PAGE_NAMES[path] || path;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a] text-white">
        <p className="text-white/50">加载中...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a] text-white">
        <p>统计数据加载失败</p>
      </div>
    );
  }

  const todayTotal = stats.today?.total || 0;
  const yesterday = stats.days[1]?.total || 0;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-white/40 hover:text-white/70 transition-colors text-sm">
          &larr; 返回首页
        </Link>
        <span className="text-white/30 text-xs">
          {stats.lastUpdated ? `最后更新: ${new Date(stats.lastUpdated).toLocaleString('zh-CN')}` : ''}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {/* 总览卡片 */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="总访问量" value={stats.total.toLocaleString()} />
          <StatCard label="今日" value={todayTotal.toLocaleString()} sub={yesterday > 0 ? `${yesterday > todayTotal ? '↓' : '↑'} 昨日 ${yesterday}` : undefined} />
          <StatCard label="日均" value={stats.days.length > 0 ? Math.round(stats.total / stats.days.length).toLocaleString() : '0'} sub={`${stats.days.length} 天数据`} />
        </div>

        {/* 30天趋势简易柱状图 */}
        <Section title="近 30 天访问趋势">
          <div className="flex items-end gap-1 h-32 mt-3">
            {[...stats.days].reverse().map((day) => {
              const maxVal = Math.max(...stats.days.map((d) => d.total), 1);
              const height = Math.max((day.total / maxVal) * 100, 2);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500/60 to-indigo-400/40 hover:from-indigo-400 hover:to-indigo-300 transition-colors"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-white/20 group-hover:text-white/50 transition-colors">
                    {day.date.slice(5)}
                  </span>
                  {/* tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-2 py-0.5 rounded text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {day.date}: {day.total} 次
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 流量来源 */}
        <Section title="流量来源">
          <div className="space-y-2 mt-3">
            {stats.referrers.length === 0 ? (
              <p className="text-white/30 text-sm">暂无数据</p>
            ) : (
              stats.referrers.map(([ref, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={ref} className="flex items-center gap-3">
                    <span className="text-sm text-white/60 w-28 truncate">{ref}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500/50 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-white/40 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })
            )}
          </div>
        </Section>

        {/* 页面排行 */}
        <Section title="页面访问排行">
          <div className="space-y-2 mt-3">
            {stats.topPages.map(([page, count], i) => (
              <div key={page} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/20 w-5">{i + 1}</span>
                  <span className="text-sm text-white/70">{pageName(page)}</span>
                  <span className="text-[10px] text-white/20">{page}</span>
                </div>
                <span className="text-sm text-white/50 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </Section>

        <p className="text-center text-white/15 text-xs pt-4">
          数据存储在 Netlify Blobs · 完全免费 · 实时更新
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-medium text-white/70">{title}</h2>
      {children}
    </section>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/3 rounded-xl p-4 border border-white/5">
      <p className="text-xs text-white/30 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white/90 font-mono">{value}</p>
      {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
    </div>
  );
}
