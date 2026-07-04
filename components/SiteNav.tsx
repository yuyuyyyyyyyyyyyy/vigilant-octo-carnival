'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: '分析' },
  { href: '/method', label: '方法' },
  { href: '/examples', label: '样例' },
  { href: '/history', label: '历史' },
  { href: '/profile', label: '档案' },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-1/2 top-5 z-40 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#040814]/58 px-2 py-2 shadow-[0_18px_70px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:flex">
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative rounded-full px-4 py-2 text-xs transition-all duration-300"
            style={{
              color: active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.38)',
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 28px rgba(98,168,255,0.08)' : 'none',
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}