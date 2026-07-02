import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export async function GET() {
  try {
    const store = getStore('analytics');
    const raw = await store.get('pageviews');

    if (!raw) {
      return NextResponse.json({
        total: 0,
        days: {},
        referrers: {},
        lastUpdated: null,
        message: '还没有访问数据',
      });
    }

    const data = JSON.parse(raw);

    // 按日期倒序排列最近 30 天
    const sortedDays = Object.entries(data.days)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 30)
      .map(([date, d]: [string, any]) => ({
        date,
        total: d.total,
        pages: d.pages,
      }));

    // 按访问量排序来源
    const sortedReferrers = Object.entries(data.referrers)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 20);

    // 汇总页面访问量
    const pageTotals: Record<string, number> = {};
    sortedDays.forEach((day) => {
      Object.entries(day.pages).forEach(([page, count]: [string, any]) => {
        pageTotals[page] = (pageTotals[page] || 0) + count;
      });
    });
    const topPages = Object.entries(pageTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return NextResponse.json({
      total: data.total,
      days: sortedDays,
      today: sortedDays[0] || null,
      referrers: sortedReferrers,
      topPages,
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
