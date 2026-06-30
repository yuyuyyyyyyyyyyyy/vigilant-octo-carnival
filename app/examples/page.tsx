import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import StarryBackground from '@/components/StarryBackground';

const examples = [
  '一个结果与期待不一致的时刻',
  '一个无法判断自己是否被误解的情境',
  '一个对自我能力产生怀疑的事件',
  '一个来自他人评价但无法验证的反馈',
  '一个反复回想但无法确定原因的经历',
  '一个明明有情绪但说不清是什么感受的瞬间',
];

const colors = ['#FF5A70', '#FFD36A', '#61D99B', '#62A8FF', '#A78BFA', '#7DD3FC'];

export default function ExamplesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <StarryBackground />
      <SiteNav />
      <section className="page-shell">
        <Link href="/" className="text-sm text-white/36 transition-colors hover:text-white/72">返回分析</Link>
        <div className="mt-10">
          <p className="page-kicker">EXAMPLES</p>
          <h1 className="page-title">适合放进棱镜里的事件。</h1>
          <p className="page-copy">越具体越好：一句话、一个场景、一个反复回想的片段。系统会尽量保留不确定性，而不是替你盖棺定论。</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example, index) => (
            <article key={example} className="premium-panel group p-5 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-5 h-1 w-20 rounded-full" style={{ background: `linear-gradient(90deg, ${colors[index]}cc, transparent)` }} />
              <p className="text-sm leading-7 text-white/62">{example}</p>
              <p className="mt-5 font-mono text-[10px] tracking-[0.22em] text-white/22">SAMPLE {String(index + 1).padStart(2, '0')}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
