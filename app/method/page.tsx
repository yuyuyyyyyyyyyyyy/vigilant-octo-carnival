import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import StarryBackground from '@/components/StarryBackground';

const steps = [
  ['01', '事件信号', '只处理你写下来的材料，先把事实、感受和推测分开。'],
  ['02', '多模型折射', '从认知心理学、社会学、系统论、关系视角等方向生成互相竞争的解释。'],
  ['03', '关键变量', '列出如果补充后可能改变解释的信息，避免把单一故事当成结论。'],
  ['04', '下一步实验', '输出一个可观察的小行动，用现实反馈修正解释。'],
];

export default function MethodPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <StarryBackground />
      <SiteNav />
      <section className="page-shell">
        <Link href="/" className="text-sm text-white/36 transition-colors hover:text-white/72">返回分析</Link>
        <div className="mt-10">
          <p className="page-kicker">METHOD</p>
          <h1 className="page-title">不是判断你，而是校准解释。</h1>
          <p className="page-copy">多棱镜把“我是不是想太多了”这种封闭问题，改写成“有哪些解释可能成立，它们还缺什么证据”。页面上的棱镜视觉也遵循同一个原则：入射、折射、强度损耗和落点都保持一致的几何关系。</p>
        </div>

        <div className="mt-12 spectrum-rule" />

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map(([no, title, body]) => (
            <article key={no} className="premium-panel p-6">
              <span className="font-mono text-xs tracking-[0.18em] text-cyan-100/32">{no}</span>
              <h2 className="mt-4 text-xl font-semibold text-white/84">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/50">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
