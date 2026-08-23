export type LrcLine = { time: number; text: string };

// LRC formatlarını ayrıştırır: [mm:ss.xx], [mm:ss:xx], [mm:ss.xxx], [mm:ss]
export function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = [];
  const re = /\[(\d+):(\d{2})(?:[.:](\d+))?\]/g;

  for (const rawLine of lrc.split("\n")) {
    const matches = [...rawLine.matchAll(re)];
    if (matches.length === 0) continue;
    
    // Satırdaki tüm zaman etiketlerini temizle
    const text = rawLine.replace(re, "").trim();
    
    for (const m of matches) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      
      let msStr = m[3] || "0";
      if (msStr.length === 1) msStr += "00";
      else if (msStr.length === 2) msStr += "0";
      else if (msStr.length > 3) msStr = msStr.substring(0, 3);
      
      const ms = parseInt(msStr, 10);
      lines.push({ time: min * 60 + sec + ms / 1000, text });
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
