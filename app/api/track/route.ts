import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

interface AnalyticsData {
  total: number;
  days: Record<string, { total: number; pages: Record<string, number> }>;
  referrers: Record<string, number>;
  lastUpdated: string;
}

const DEFAULT_DATA: AnalyticsData = {
  total: 0,
  days: {},
  referrers: {},
  lastUpdated: new Date().toISOString(),
};

function today(): string {
  return new Date().toISOString().slice(0, 10); // "2026-07-01"
}

function getReferrerKey(ref: string): string {
  if (!ref || ref === '') return '直接访问';
  try {
    const url = new URL(ref);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return ref.substring(0, 30);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = body.path || '/';
    const referrer = body.referrer || request.headers.get('referer') || '';

    const store = getStore('analytics');
    const raw = await store.get('pageviews');
    const data: AnalyticsData = raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : { ...DEFAULT_DATA };

    const day = today();
    const refKey = getReferrerKey(referrer);

    // 确保数据结构存在
    if (!data.days[day]) {
      data.days[day] = { total: 0, pages: {} };
      // 只保留最近 90 天
      const keys = Object.keys(data.days).sort();
      while (keys.length > 90) {
        delete data.days[keys.shift()!];
      }
    }
    if (!data.days[day].pages[path]) {
      data.days[day].pages[path] = 0;
    }
    if (!data.referrers[refKey]) {
      data.referrers[refKey] = 0;
    }

    // 递增计数
    data.total += 1;
    data.days[day].total += 1;
    data.days[day].pages[path] += 1;
    data.referrers[refKey] += 1;
    data.lastUpdated = new Date().toISOString();

    await store.set('pageviews', JSON.stringify(data));

    return NextResponse.json({ ok: true, total: data.total });
  } catch (error) {
    console.error('Track error:', error);
    // 静默失败，不影响用户体验
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
