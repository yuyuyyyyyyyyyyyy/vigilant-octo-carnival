import { NextRequest, NextResponse } from 'next/server';

const SENDKEY = process.env.SERVERCHAN_KEY || 'SCT373529TVlkxZBBkZ4VOgW1CxkUMQFm7';
const API = `https://sctapi.ftqq.com/${SENDKEY}.send`;

// 简单的内存去重：同页面 + 同来源 5 分钟内不重复通知
const cooldown = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { path, referrer } = await request.json().catch(() => ({}));
    const page = path || '/';

    // 去重
    const now = Date.now();
    const key = `${page}|${referrer || 'direct'}`;
    const last = cooldown.get(key);
    if (last && now - last < 300_000) {
      return NextResponse.json({ ok: true, dedup: true });
    }
    cooldown.set(key, now);

    // 修剪旧记录
    if (cooldown.size > 200) {
      const expire = now - 600_000;
      for (const [k, t] of cooldown) {
        if (t < expire) cooldown.delete(k);
      }
    }

    const source = referrer
      ? `来源：${new URL(referrer).hostname.replace('www.', '')}`
      : '直接访问';

    const title = `多棱镜 · 新访问`;
    const desp = `**页面**：${page}\n**${source}**\n时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;

    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, desp }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
