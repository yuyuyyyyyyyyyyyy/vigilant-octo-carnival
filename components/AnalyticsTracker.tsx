'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const COUNTER_URL = 'https://api.countapi.xyz/hit/duolengjing/visits';
const PATH_COUNTER_URL = 'https://api.countapi.xyz/hit/duolengjing';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const tracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 同一路径只上报一次
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);

    // 总量 +1
    fetch(COUNTER_URL, { method: 'GET' }).catch(() => {});

    // 每页单独计数
    const pageKey = pathname === '/' ? 'home' : pathname.replace(/\//g, '-').replace(/^-/, '');
    fetch(`${PATH_COUNTER_URL}/${pageKey}`, { method: 'GET' }).catch(() => {});
  }, [pathname]);

  return null;
}
