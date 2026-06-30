'use client';

import { useEffect, useRef } from 'react';

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const stars: Array<{
      x: number; y: number;
      r: number; opacity: number;
      speed: number; phase: number;
      vx: number; vy: number; // 漂移速度
    }> = [];

    const shootingStars: Array<{
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      len: number;
    }> = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createStars() {
      const count = Math.floor((canvas!.width * canvas!.height) / 1600);
      stars.length = 0;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const drift = Math.random() * 0.1 + 0.015;
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 0.9 + 0.05,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.3 + 0.06,
          phase: Math.random() * Math.PI * 2,
          vx: Math.cos(angle) * drift,
          vy: Math.sin(angle) * drift,
        });
      }
    }

    function spawnShootingStar() {
      const w = canvas!.width;
      const h = canvas!.height;
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4 + 3;
      shootingStars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 60 + 40,
        len: Math.random() * 80 + 40,
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const time = Date.now() * 0.001;

      // 随机生成流星
      if (Math.random() < 0.003) {
        spawnShootingStar();
      }

      // 绘制流星
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life > s.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }
        const progress = s.life / s.maxLife;
        const alpha = progress < 0.15 ? progress / 0.15 : (1 - progress);

        const tailX = s.x - s.vx * s.len * 0.1;
        const tailY = s.y - s.vy * s.len * 0.1;
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 头部光点
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      // 绘制星空
      for (const star of stars) {
        // 漂移
        star.x += star.vx;
        star.y += star.vy;

        // 屏幕环绕
        if (star.x < -5) star.x = w + 5;
        if (star.x > w + 5) star.x = -5;
        if (star.y < -5) star.y = h + 5;
        if (star.y > h + 5) star.y = -5;

        // 闪烁 + 呼吸
        const twinkle = Math.sin(time * star.speed * 3 + star.phase) * 0.35 + 0.65;
        const alpha = star.opacity * twinkle;

        // 星点
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 215, 255, ${alpha})`;
        ctx.fill();

        // 光晕（仅较亮星）
        if (star.r > 0.45 && twinkle > 0.85) {
          const haloR = star.r * 3;
          const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, haloR);
          grad.addColorStop(0, `rgba(210, 225, 255, ${alpha * 0.4})`);
          grad.addColorStop(1, 'rgba(210, 225, 255, 0)');
          ctx.beginPath();
          ctx.arc(star.x, star.y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // 亮星有十字星芒
        if (star.r > 0.65 && twinkle > 0.92) {
          const flareAlpha = alpha * 0.2;
          for (const angle of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
            ctx.beginPath();
            ctx.moveTo(
              star.x + Math.cos(angle) * star.r * 2,
              star.y + Math.sin(angle) * star.r * 2
            );
            ctx.lineTo(
              star.x + Math.cos(angle) * star.r * 6,
              star.y + Math.sin(angle) * star.r * 6
            );
            ctx.strokeStyle = `rgba(230,240,255,${flareAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createStars();
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <>
      {/* 深蓝渐变底 */}
      <div className="fixed inset-0 bg-gradient-deep" />

      {/* 动态极光光晕 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-aurora-1 blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-aurora-2 blur-[100px] opacity-50" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-aurora-3 blur-[80px] opacity-40" />
      </div>

      {/* 星空粒子 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* 细微噪点纹理 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")',
          zIndex: 2,
        }}
      />
    </>
  );
}
