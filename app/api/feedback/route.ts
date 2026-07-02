export async function POST(request: Request) {
  const body = await request.json() as { text?: string; type?: string };
  const text = body.text || '';
  const type = (body.type === 'bug' || body.type === 'idea' || body.type === 'other')
    ? body.type
    : 'other';

  if (!text || typeof text !== 'string' || text.trim().length < 2) {
    return Response.json({ ok: false, error: '内容太短' }, { status: 400 });
  }

  const typeLabel = { bug: '🐛 Bug', idea: '💡 想法', other: '💬 其他' }[type] || '💬 其他';
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const url =
    'https://sctapi.ftqq.com/SCT373529TVlkxZBBkZ4VOgW1CxkUMQFm7' +
    '?title=' + encodeURIComponent(`多棱镜 · 用户反馈`) +
    '&desp=' + encodeURIComponent(
      `**类型**：<span style="color:#6366f1">${typeLabel}</span>\n\n` +
      `**内容**：\n${text.trim()}\n\n` +
      `**时间**：${now}`
    );

  try {
    await fetch(url, { method: 'POST' });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: '发送失败' }, { status: 500 });
  }
}
