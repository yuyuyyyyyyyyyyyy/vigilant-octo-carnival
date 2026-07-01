'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';

interface ShareCardProps {
  result: AnalysisResult;
  input: string;
  onClose: () => void;
}

const COLORS = ['#FF5A70', '#FFD36A', '#61D99B'];

export default function ShareCard({ result, input, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cardRef.current, {
        backgroundColor: '#050914',
        pixelRatio: 2,
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prism-result.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download image failed:', err);
      await handleCopyText();
    }
  }, [result, input]);

  const handleCopyText = useCallback(async () => {
    const expForText = result.next_experiment
      ? (typeof result.next_experiment === 'string' ? result.next_experiment : result.next_experiment.design)
      : (result.experiment || '');
    const text = `我用多棱镜重新理解了一件事\n\n事件：${input}\n\n${result.models.length} 种解释角度：\n${result.models.map((m, i) => `${i + 1}. ${m.name}（解释力 ${m.score}/5）\n   ${(m.content || m.logic || m.explanation || '').slice(0, 80)}...`).join('\n\n')}\n\n下一步实验：\n${expForText}\n\n-- 多棱镜 · 第 ${result.version} 版解释`;
    await navigator.clipboard.writeText(text);
    alert('已复制文本到剪贴板');
  }, [result, input]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/52 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={cardRef} className="premium-panel p-6" style={{ backgroundColor: '#050914' }}>
          <div className="spectrum-rule mb-5" />
          <div className="text-center">
            <p className="panel-kicker">MULTI-PRISM REPORT</p>
            <p className="mx-auto mt-4 max-w-sm px-2 text-base italic leading-8 text-white/68">
              &ldquo;{input.length > 86 ? input.slice(0, 86) + '...' : input}&rdquo;
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            {result.models.slice(0, 3).map((m, i) => (
              <div key={i} className="rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-medium text-white/58">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS[i], boxShadow: `0 0 8px ${COLORS[i]}66` }} />
                    {m.name}
                  </span>
                  <span className="text-[10px] text-white/22">{m.score}/5</span>
                </div>
                <p className="text-xs leading-6 text-white/38">{(m.content || m.logic || m.explanation || '').slice(0, 72)}...</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-xs text-white/18">多棱镜 · 第 {result.version} 版解释</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={handleDownloadImage} className="analysis-primary-button flex-1">保存图片</button>
          <button onClick={handleCopyText} className="analysis-ghost-button flex-1">复制文本</button>
          <button onClick={onClose} className="analysis-ghost-button px-4">关闭</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
