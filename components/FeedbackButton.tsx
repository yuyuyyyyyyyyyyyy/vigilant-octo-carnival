'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/** 反馈弹窗 — Portal 挂到 body，不受父容器 z-index 限制 */
function FeedbackModalInner({
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
  const [mounted, setMounted] = useState(false);

  // 客户端挂载后才启用 Portal
  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ background: 'rgba(2,4,8,0.65)', backdropFilter: 'blur(14px)' }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#0A0E1A]/96 p-7 shadow-[0_32px_100px_rgba(0,0,0,0.65)]"
            onClick={e => e.stopPropagation()}
          >
            {done ? (
              <div className="flex flex-col items-center py-10 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-3 text-3xl"
                >
                  ✓
                </motion.div>
                <p className="text-sm text-white/50">已收到，谢谢</p>
              </div>
            ) : (
              <>
                <p className="text-[9px] font-mono tracking-[0.28em] text-white/14">FEEDBACK</p>
                <h3 className="mt-1.5 text-base font-medium text-white/65">说点什么</h3>
                <p className="mt-0.5 text-[11px] leading-5 text-white/22">
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
                        borderColor: type === key ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                        background: type === key ? 'rgba(99,102,241,0.08)' : 'transparent',
                        color: type === key ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)',
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
                  className="mt-4 w-full rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 text-sm text-white/55 placeholder:text-white/10 focus:border-white/12 focus:outline-none resize-none"
                />

                <div className="mt-5 flex justify-end gap-2.5">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl px-4 py-2 text-[11px] text-white/25 transition-colors hover:text-white/45"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="rounded-xl bg-indigo-500/15 px-5 py-2 text-[11px] font-medium text-white/55 transition-all hover:bg-indigo-500/22 disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    {sending ? '发送中…' : '发送'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** 底部文字链接版本 */
export function FeedbackLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] tracking-[0.12em] text-white/12 transition-colors hover:text-white/35"
      >
        反馈
      </button>
      <FeedbackModalInner open={open} onOpenChange={setOpen} />
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
      <FeedbackModalInner open={open} onOpenChange={setOpen} />
    </>
  );
}
