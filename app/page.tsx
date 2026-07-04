'use client';

import { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import EventInput from '@/components/EventInput';
import ModelCard from '@/components/ModelCard';
import VariablesList from '@/components/VariablesList';
import ExperimentBox from '@/components/ExperimentBox';
import ShareCard from '@/components/ShareCard';
import PrismScene from '@/components/PrismScene';
import StarryBackground from '@/components/StarryBackground';
import SiteNav from '@/components/SiteNav';
import { FeedbackLink } from '@/components/FeedbackButton';
import FeedbackButton from '@/components/FeedbackButton';
import { AnalysisResult } from '@/lib/types';
import { saveEntry } from '@/lib/history';

interface Pt { x: number; y: number; }

function readLocalProfile() {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem('prism-local-profile');
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function useCardLayout() {
  const [card, setCard] = useState({ x: 0, y: 0, w: 760, h: 260 });
  const [beamReady, setBeamReady] = useState(false);
  const [beamEnds, setBeamEnds] = useState<Pt[]>([
    { x: 275, y: 318 }, { x: 423, y: 318 }, { x: 577, y: 318 }, { x: 725, y: 318 },
  ]);
  const [beamBottom, setBeamBottom] = useState<Pt[]>([
    { x: 275, y: 525 }, { x: 423, y: 525 }, { x: 577, y: 525 }, { x: 725, y: 525 },
  ]);

  useLayoutEffect(() => {
    const calc = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cw = Math.min(740, W - 48);
      const ch = 175;
      const desktopShift = W >= 900 ? Math.min(110, W * 0.045) : 0;
      const x = Math.round((W - cw) / 2 + desktopShift);
      const y = Math.round((H - ch) / 2 + 28);
      setCard({ x, y, w: cw, h: ch });

      const vbW = 1000, vbH = 800;
      const s = Math.max(W / vbW, H / vbH);
      const vbLeft = (vbW - W / s) / 2;
      const vbTop = (vbH - H / s) / 2;
      const toSvg = (px: number, py: number): Pt => ({
        x: vbLeft + px / s,
        y: vbTop + py / s,
      });

      const eventCard = document.getElementById('event-card');
      const rect = eventCard?.getBoundingClientRect();
      const target =
        rect && rect.width > 0 && rect.height > 0
          ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
          : { x, y, w: cw, h: ch };

      const inset = 28;
      const tl = toSvg(target.x + inset, target.y);
      const tr = toSvg(target.x + target.w - inset, target.y);
      const bl = toSvg(target.x + inset, target.y + target.h);
      const br = toSvg(target.x + target.w - inset, target.y + target.h);

      const newEnds: Pt[] = [
        { x: tl.x + (tr.x - tl.x) * 0.15, y: tl.y },
        { x: tl.x + (tr.x - tl.x) * 0.38, y: tl.y },
        { x: tl.x + (tr.x - tl.x) * 0.62, y: tl.y },
        { x: tl.x + (tr.x - tl.x) * 0.85, y: tl.y },
      ];
      const newBottom: Pt[] = [
        { x: bl.x + (br.x - bl.x) * 0.15, y: bl.y },
        { x: bl.x + (br.x - bl.x) * 0.38, y: bl.y },
        { x: bl.x + (br.x - bl.x) * 0.62, y: bl.y },
        { x: bl.x + (br.x - bl.x) * 0.85, y: bl.y },
      ];
      setBeamEnds(newEnds);
      setBeamBottom(newBottom);
      setBeamReady(true);
    };

    let observer: ResizeObserver | null = null;
    let frame = 0;
    let attempts = 0;

    const bindCard = () => {
      calc();
      const eventCard = document.getElementById('event-card');
      if (eventCard && !observer) {
        observer = new ResizeObserver(calc);
        observer.observe(eventCard);
      }
      if (!eventCard && attempts < 60) {
        attempts += 1;
        frame = window.requestAnimationFrame(bindCard);
      }
    };

    bindCard();
    const settleInterval = window.setInterval(calc, 80);
    const settleTimeout = window.setTimeout(() => window.clearInterval(settleInterval), 1600);
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('resize', calc);
      window.cancelAnimationFrame(frame);
      window.clearInterval(settleInterval);
      window.clearTimeout(settleTimeout);
      observer?.disconnect();
    };
  }, []);

  return { card, beamReady, beamEnds, beamBottom };
}

export default function Home() {
  const [input, setInput] = useState('');
  const [draftInput, setDraftInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previousResult, setPreviousResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showShare, setShowShare] = useState(false);

  const { card, beamReady, beamEnds, beamBottom } = useCardLayout();

  const handleAnalyze = useCallback(async (text: string) => {
    setInput(text);
    setPreviousResult(null);
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, version: 1, profile: readLocalProfile() }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        saveEntry(text, data.data);
      } else setError(data.error || '分析失败');
    } catch (err) {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReInterpret = useCallback(async () => {
    if (!input) return;
    setPreviousResult(result);
    setIsLoading(true);
    setError('');

    const nextVersion = (result?.version || 1) + 1;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, version: nextVersion, profile: readLocalProfile() }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        saveEntry(input, data.data);
      } else setError(data.error || '重新解释失败');
    } catch (err) {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsLoading(false);
    }
  }, [input, result]);

  const handleReInterpretWithInput = useCallback(async (text: string, prevResult: AnalysisResult) => {
    setInput(text);
    setDraftInput(text);
    setPreviousResult(prevResult);
    setIsLoading(true);
    setError('');

    const nextVersion = (prevResult.version || 1) + 1;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, version: nextVersion, profile: readLocalProfile() }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        saveEntry(text, data.data);
      } else setError(data.error || '重新解释失败');
    } catch (err) {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setInput('');
    setDraftInput('');
    setResult(null);
    setPreviousResult(null);
    setError('');
    setShowShare(false);
  }, []);

  useEffect(() => {
    const revisitRaw = sessionStorage.getItem('prism-revisit-entry');
    const reanalyzeRaw = sessionStorage.getItem('prism-reanalyze-entry');
    sessionStorage.removeItem('prism-revisit-entry');
    sessionStorage.removeItem('prism-reanalyze-entry');

    const raw = reanalyzeRaw || revisitRaw;
    if (!raw) return;

    try {
      const entry = JSON.parse(raw) as { input?: string; result?: AnalysisResult };
      if (!entry.input || !entry.result) return;
      if (reanalyzeRaw) handleReInterpretWithInput(entry.input, entry.result);
      else {
        setInput(entry.input);
        setDraftInput(entry.input);
        setResult(entry.result);
        setPreviousResult(null);
      }
    } catch {
      // Ignore stale or malformed history handoff data.
    }
  }, [handleReInterpretWithInput]);

  const hasResult = !!result;

  return (
    <main className="min-h-screen flex flex-col relative overflow-x-hidden">
      <StarryBackground />
      <SiteNav />

      <PrismScene
        collapsed={hasResult || isLoading}
        ends={beamEnds}
        cardBottom={beamBottom}
        ready={beamReady}
        inputSignal={Math.min(1, draftInput.trim().length / 180)}
      />

      {isLoading && !hasResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="flex text-3xl font-light tracking-[0.16em]">
            {['正', '在', '折', '射'].map((char, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  color: '#c8dcff',
                  textShadow: '0 0 20px rgba(180,204,255,0.35)',
                  opacity: 0,
                  animation: `charGlow 3s ${i * 0.35}s ease-in-out infinite`,
                }}
              >
                {char}
              </span>
            ))}
          </div>

          <style jsx>{`
            @keyframes charGlow {
              0%, 10% { opacity: 0; }
              18% { opacity: 1; }
              28% { opacity: 0.55; }
              38%, 100% { opacity: 0.18; }
            }
          `}</style>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1.5 h-px w-20 bg-white/06"
            style={{ transformOrigin: 'center' }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-1.5 text-xs tracking-[0.2em] text-white/14"
          >
            事实 · 多种解释 · 行动假设
          </motion.p>
        </motion.div>
      )}

      <Header minimal={hasResult} onClickHome={handleReset} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto max-w-2xl w-full px-6 relative z-30"
          >
            <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-4 text-sm text-red-200 text-center backdrop-blur-md">
              {error}
              <button onClick={() => setError('')} className="ml-3 underline cursor-pointer">关闭</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 flex-1">
        <AnimatePresence mode="wait">
          {hasResult ? (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative min-h-[calc(100vh-88px)] px-4 sm:px-6 py-6 lg:py-8"
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[12%] h-px w-[60vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/08 to-transparent" />
              </div>

              <div className="relative mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
                <motion.aside
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="analysis-panel sticky top-6 overflow-hidden p-5 sm:p-6 lg:min-h-[calc(100vh-140px)]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="relative">
                    <p className="text-[10px] font-mono tracking-[0.28em] text-white/20">分析报告</p>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-semibold leading-tight text-white/86">解释已展开</h1>
                  </div>

                  {previousResult && (
                    <div className="relative mt-5 rounded-[14px] border border-white/04 bg-white/[0.012] p-4">
                      <p className="text-[10px] font-mono tracking-[0.16em] text-white/12">上一版本 #{previousResult.version}</p>
                      <div className="mt-2 grid gap-1.5">
                        {previousResult.models?.map((m, i) => (
                          <p key={i} className="text-[11px] leading-5 text-white/18">
                            <span className="text-white/12">{i + 1}.</span> {m.name.length > 20 ? m.name.slice(0, 20) + '…' : m.name}
                          </p>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] leading-5 text-white/10">
                        对比下方新版本，观察哪些视角保持了一致，哪些发生了偏移。
                      </p>
                    </div>
                  )}

                  <div className="premium-panel relative mt-8 p-5">
                    <p className="text-[10px] font-mono tracking-[0.18em] text-white/16">现象{result.event_type ? ` · ${result.event_type}` : ''}</p>
                    <p className="mt-3 text-base sm:text-lg leading-8 text-white/62 italic">&ldquo;{result.phenomenon || result.event_reconstruction || result.event_summary}&rdquo;</p>
                  </div>

                  {(result.conflict || result.core_question) && (
                    <div className="premium-panel relative mt-5 p-5">
                      <p className="text-[10px] font-mono tracking-[0.18em] text-white/16">真正的问题</p>
                      {result.conflict && <p className="mt-3 text-sm leading-7 text-white/48">{result.conflict}</p>}
                      {result.core_question && <p className="mt-3 border-l border-white/[0.1] pl-3 text-xs leading-6 text-white/32">{result.core_question}</p>}
                    </div>
                  )}

                  {result.facts && result.facts.length > 0 && (
                    <div className="premium-panel relative mt-5 p-5">
                      <p className="text-[10px] font-mono tracking-[0.18em] text-white/16">可验证事实</p>
                      <ul className="mt-3 grid gap-2">
                        {result.facts.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm leading-6 text-white/46">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="relative mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <p className="text-[10px] font-mono tracking-[0.18em] text-white/16">解释视角</p>
                      <p className="mt-2 text-2xl font-light text-white/72">{result.models.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <p className="text-[10px] font-mono tracking-[0.18em] text-white/16">版本</p>
                      <p className="mt-2 text-2xl font-light text-white/72">#{result.version}</p>
                    </div>
                  </div>

                  <div className="premium-panel relative mt-5 p-5">
                    <p className="text-[10px] font-mono tracking-[0.18em] text-white/14">原则</p>
                    <p className="mt-3 text-[11px] leading-6 text-white/32">
                      所有解释均可修正 · 不存在唯一结论 · 不进行人格判断 · 所有分析指向可验证行动
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative mt-7 flex flex-wrap items-center gap-3"
                  >
                    <button onClick={handleReset} className="analysis-ghost-button">重新输入</button>
                    <motion.button
                      onClick={handleReInterpret}
                      disabled={isLoading}
                      className="analysis-ghost-button disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '重新解释中...' : '重新解释'}
                    </motion.button>
                    <button onClick={() => setShowShare(true)} className="analysis-ghost-button">分享</button>
                    <FeedbackButton />
                  </motion.div>
                </motion.aside>

                <div className="relative space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.16 }}
                    className="pointer-events-none absolute -top-7 left-1 px-1"
                  >
                    <p className="panel-kicker">多种视角</p>
                  </motion.div>

                  <div className="grid gap-4">
                    {result.models.map((model, i) => (
                      <ModelCard key={`${model.name}-${i}`} model={model} index={i} />
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr] items-start">
                    <VariablesList variables={result.categorized_variables || result.key_variables || result.variables} />
                    <ExperimentBox experiment={result.next_experiment || result.experiment || ''} />
                  </div>

                  {result.conflict_analysis && result.conflict_analysis.conflicts && result.conflict_analysis.conflicts.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.75 }}
                      className="premium-panel p-5"
                    >
                      <p className="text-[10px] font-mono tracking-[0.2em] text-white/16">解释冲突</p>
                      {result.conflict_analysis.dependency_map && (
                        <p className="mt-2 text-[11px] leading-5 text-white/18">{result.conflict_analysis.dependency_map}</p>
                      )}
                      <div className="mt-4 space-y-3">
                        {result.conflict_analysis.conflicts.map((c, i) => (
                          <div key={i} className="border-l-2 border-white/08 pl-3">
                            <p className="text-sm text-white/52">
                              <span className="text-white/36">{c.model_a}</span>
                              <span className="mx-2 text-white/10">vs</span>
                              <span className="text-white/36">{c.model_b}</span>
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-white/24">{c.conflict_point}</p>
                            {c.resolution_hint && (
                              <p className="mt-1 text-[10px] leading-5 text-white/16">→ {c.resolution_hint}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.section>
                  )}
                </div>
              </div>
            </motion.section>
          ) : !isLoading ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -40 }}
              transition={{ duration: 0.45 }}
            >
              <EventInput
                onSubmit={handleAnalyze}
                isLoading={isLoading}
                collapsed={hasResult}
                offset={card}
                onDraftChange={setDraftInput}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showShare && result && (
          <ShareCard result={result} input={input} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>

      <footer className="w-full py-4 text-center">
        <FeedbackLink />
      </footer>
    </main>
  );
}