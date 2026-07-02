'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const tracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 同一路径只上报一次（避免 React StrictMode 重复触发）
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer,
      }),
    }).catch(() => {
      // 静默失败，不影响用户体验
    });
  }, [pathname]);

  return null; // 不渲染任何 UI
}
