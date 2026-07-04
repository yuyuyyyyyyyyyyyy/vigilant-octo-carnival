'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import StarryBackground from '@/components/StarryBackground';
import { getHistory } from '@/lib/history';

type LocalProfile = {
  name: string;
  lens: string;
  tone: string;
};

const PROFILE_KEY = 'prism-local-profile';

const lensOptions = [
  { id: '机制', title: '机制优先', body: '先看现象如何发生，再看它可能属于哪种解释。', color: '#62A8FF' },
  { id: '关系', title: '关系视角', body: '更关注互动、期待差异和信息不对称。', color: '#61D99B' },
  { id: '记忆', title: '记忆重构', body: '更关注当下如何改变对旧事件的理解。', color: '#FFD36A' },
];

const toneOptions = ['克制', '直接', '细致'];

export default function ProfilePage() {
  const [profile, setProfile] = useState<LocalProfile>({ name: '', lens: '机制', tone: '克制' });
  const [historyCount, setHistoryCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setProfile((prev) => ({ ...prev, ...JSON.parse(raw) }));
      setHistoryCount(getHistory().length);
    } catch {
      setHistoryCount(0);
    }
  }, []);

  const displayName = useMemo(() => profile.name.trim() || '未命名观察者', [profile.name]);

  const saveProfile = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const clearProfile = () => {
    localStorage.removeItem(PROFILE_KEY);
    setProfile({ name: '', lens: '机制', tone: '克制' });
    setSaved(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <StarryBackground />
      <SiteNav />

      <section className="page-shell">
        <Link href="/" className="text-sm text-white/36 transition-colors hover:text-white/72">返回分析</Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="page-kicker">LOCAL PROFILE</p>
            <h1 className="page-title">给这台设备留一个入口。</h1>
            <p className="page-copy">不创建账号，不上传资料。这里保存的只是本地昵称、阅读偏好和历史记录入口，让下次回来时更像回到同一束光里。</p>
          </div>

          <div className="premium-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/18">本地身份</p>
            <div className="mt-5 flex items-end justify-between gap-5">
              <div>
                <p className="text-3xl font-serif text-white/86">{displayName}</p>
                <p className="mt-2 text-xs leading-6 text-white/28">只保存在当前浏览器。清理浏览器数据后会消失。</p>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4 text-right">
                <p className="font-mono text-[10px] tracking-[0.18em] text-white/18">RECORDS</p>
                <p className="mt-1 text-2xl font-light text-white/70">{historyCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 spectrum-rule" />

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="premium-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/18">SIGN IN LOCALLY</p>
            <label className="mt-5 block text-xs tracking-[0.12em] text-white/28">你希望这里怎么称呼你</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例如：一个正在观察的人"
              className="mt-3 w-full rounded-[16px] border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white/78 placeholder:text-white/20 outline-none transition-colors focus:border-white/[0.18]"
              maxLength={24}
            />

            <div className="mt-6">
              <p className="text-xs tracking-[0.12em] text-white/28">解释语气</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {toneOptions.map((tone) => {
                  const active = profile.tone === tone;
                  return (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, tone }))}
                      className="rounded-full border px-4 py-2 text-xs transition-all"
                      style={{
                        color: active ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.34)',
                        borderColor: active ? 'rgba(226,232,240,0.2)' : 'rgba(255,255,255,0.07)',
                        background: active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.018)',
                      }}
                    >
                      {tone}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={saveProfile} className="analysis-primary-button">保存本地身份</button>
              <button type="button" onClick={clearProfile} className="analysis-ghost-button">清空身份</button>
              {saved && <span className="self-center text-xs text-white/30">已保存在这台设备</span>}
            </div>
          </section>

          <section className="grid gap-4">
            {lensOptions.map((lens) => {
              const active = profile.lens === lens.id;
              return (
                <button
                  key={lens.id}
                  type="button"
                  onClick={() => setProfile((prev) => ({ ...prev, lens: lens.id }))}
                  className="group relative overflow-hidden rounded-[18px] border p-5 text-left transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderColor: active ? `${lens.color}66` : 'rgba(255,255,255,0.075)',
                    background: active
                      ? `linear-gradient(135deg, ${lens.color}18, rgba(255,255,255,0.025) 44%, rgba(5,9,24,0.48))`
                      : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.018) 45%, rgba(5,9,24,0.44))',
                    boxShadow: active ? `0 24px 80px rgba(0,0,0,0.28), 0 0 42px ${lens.color}12` : '0 20px 70px rgba(0,0,0,0.24)',
                  }}
                >
                  <span className="absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${lens.color}88, transparent)` }} />
                  <span className="mb-4 block h-2 w-2 rounded-full" style={{ background: lens.color, boxShadow: `0 0 14px ${lens.color}88` }} />
                  <span className="block text-lg font-serif text-white/82">{lens.title}</span>
                  <span className="mt-2 block text-sm leading-7 text-white/42">{lens.body}</span>
                  <span className="mt-4 inline-flex rounded-full border border-white/[0.07] px-3 py-1 text-[10px] tracking-[0.16em] text-white/24">
                    {active ? '当前入口' : '选择入口'}
                  </span>
                </button>
              );
            })}
          </section>
        </div>
      </section>
    </main>
  );
}