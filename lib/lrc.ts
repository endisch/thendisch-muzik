export type LrcLine = { time: number; text: string };

// "[00:12.50] Söz satırı" formatını { time: 12.5, text: "Söz satırı" } dizisine çevirir
export function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = [];
  const re = /\[(\d{2}):(\d{2})(?:\.(\d{2}))?\]/g;

  for (const rawLine of lrc.split("\n")) {
    const matches = [...rawLine.matchAll(re)];
    if (matches.length === 0) continue;
    const text = rawLine.replace(re, "").trim();
    for (const m of matches) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      const cs = m[3] ? parseInt(m[3], 10) : 0;
      lines.push({ time: min * 60 + sec + cs / 100, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function currentLineIndex(lines: LrcLine[], elapsedSec: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= elapsedSec) idx = i;
    else break;
  }
  return idx;
}
