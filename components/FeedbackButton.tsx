'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** 反馈弹窗 — 通过 open / onOpenChange 控制 */
export function FeedbackModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [text, setText] = useState('');
  const [type, setType] = useState<'bug' | 'idea' | 'other'>('bug');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), type }),
      });
      setDone(true);
      setTimeout(() => {
        onOpenChange(false);
        setDone(false);
        setText('');
      }, 1800);
    } catch {
      alert('发送失败，请稍后再试');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: 'rgba(2,4,8,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-2xl border border-white/08 bg-[#080C1C]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            onClick={e => e.stopPropagation()}
          >
            {done ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 text-2xl">✓</div>
                <p className="text-sm text-white/55">已收到，谢谢～</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-mono tracking-[0.24em] text-white/18">FEEDBACK</p>
                <h3 className="mt-2 text-lg font-medium text-white/72">说点什么</h3>
                <p className="mt-1 text-[11px] leading-5 text-white/28">
                  Bug、想法、用得不爽的地方，都可以。
                </p>

                <div className="mt-5 flex gap-2">
                  {[
                    { key: 'bug', label: 'Bug' },
                    { key: 'idea', label: '想法' },
                    { key: 'other', label: '其他' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setType(key as 'bug' | 'idea' | 'other')}
                      className="rounded-lg border px-3 py-1.5 text-[11px] transition-all"
                      style={{
                        borderColor: type === key ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)',
                        background: type === key ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: type === key ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="说说看…"
                  rows={3}
                  className="mt-4 w-full rounded-xl border border-white/06 bg-white/[0.02] p-3 text-sm text-white/62 placeholder:text-white/14 focus:outline-none focus:border-white/14 resize-none"
                />

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl px-4 py-2 text-[11px] text-white/30 transition-colors hover:text-white/55"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="rounded-xl bg-white/06 px-5 py-2 text-[11px] text-white/62 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {sending ? '发送中…' : '发送'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 底部文字链接版本 */
export function FeedbackLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] tracking-[0.12em] text-white/22 transition-colors hover:text-white/55"
      >
        反馈
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}

/** 按钮版本 — 用于结果页操作栏 */
export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="analysis-ghost-button"
      >
        反馈
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}
