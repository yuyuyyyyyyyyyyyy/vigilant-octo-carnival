// 一键清缓存重启 dev server
// npm run clean-start [端口号]  默认 3000

import { execSync, spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const port = process.argv[2] || '3000';

console.log(`\n🧹 清理中...`);

// 1. 杀掉该端口残留进程 (Windows)
try {
  execSync(`netstat -ano | findstr ":${port} "`, { encoding: 'utf8', stdio: 'pipe' });
  const output = execSync(`netstat -ano | findstr ":${port} "`, { encoding: 'utf8' });
  const lines = output.trim().split('\n');
  const pids = new Set();
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') pids.add(pid);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
      console.log(`  ⚡ 杀掉 PID ${pid}`);
    } catch {}
  }
} catch {
  // 端口空闲，无需杀进程
}

// 2. 清 .next 缓存
const nextDir = resolve(root, '.next');
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log(`  🗑  已清 .next 缓存`);
}

// 3. 启动
console.log(`\n🚀 启动 http://localhost:${port}\n`);

const child = spawn('npx', ['next', 'dev', '-p', port], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code);
});
