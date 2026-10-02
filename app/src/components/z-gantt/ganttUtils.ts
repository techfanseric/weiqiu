// 解析时间字符串为秒，支持：
// - "SS"（纯秒）
// - "MM:SS"
// - "HH:MM:SS"
// - "HH:MM"
export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = String(timeStr).split(':').map(s => s.trim());
  if (parts.length === 1) return Number(parts[0]) || 0;
  if (parts.length === 2) {
    const m = Number(parts[0]) || 0;
    const s = Number(parts[1]) || 0;
    // treat as MM:SS
    return m * 60 + s;
  }
  // HH:MM:SS
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  const s = Number(parts[2]) || 0;
  return h * 3600 + m * 60 + s;
}

// 将秒格式化为 HH:MM:SS
export function formatSecondsToHHMMSS(totalSeconds: number): string {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// 使用 1-2-5 刻度优雅取整，返回一个 >= maxValue 的“好看”整数（以秒为单位）
export function niceCeil(maxValue: number): number {
  if (!isFinite(maxValue) || maxValue <= 0) return 60;
  const scales = [1, 2, 5];
  const pow = Math.floor(Math.log10(maxValue));
  for (let p = Math.max(0, pow - 3); p <= pow + 3; p++) {
    const b = Math.pow(10, p);
    for (const s of scales) {
      const candidate = s * b;
      if (candidate >= maxValue) return candidate;
    }
  }
  return Math.ceil(maxValue);
}

// 生成刻度数组（秒），返回 ticks 与 step（秒）
export function generateTicks(totalSeconds: number, maxTicks = 10): { ticks: number[]; majorStep: number; minorStep: number } {
  const safeTotal = Math.max(1, totalSeconds);
  const nice = niceCeil(safeTotal);

  const scales = [1, 2, 5];
  const steps: number[] = [];
  const pow = Math.floor(Math.log10(nice));
  for (let p = Math.max(0, pow - 3); p <= pow + 3; p++) {
    const base = Math.pow(10, p);
    for (const s of scales) {
      steps.push(s * base);
    }
  }
  steps.sort((a, b) => a - b);

  let majorStep = steps[steps.length - 1];
  for (const s of steps) {
    if (nice / s <= maxTicks) {
      majorStep = s;
      break;
    }
  }

  let minorStep = majorStep;
  for (const c of steps) {
    if (c >= majorStep) break;
    if (majorStep % c !== 0) continue; // prefer divisors so minors align
    if (nice / c <= maxTicks * 4) {
      minorStep = c;
      break;
    }
  }

  const estimatedCount = Math.floor(nice / minorStep) + 1;
  if (estimatedCount > maxTicks * 10) {
    minorStep = majorStep;
  }

  const ticks: number[] = [];
  for (let t = 0; t <= nice; t += minorStep) {
    ticks.push(t);
    if (ticks.length > maxTicks * 20) {
      break;
    }
  }

  return { ticks, majorStep, minorStep };
}
