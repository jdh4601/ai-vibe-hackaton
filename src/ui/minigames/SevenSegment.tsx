// Tiny seven-segment display for the multimeter readout.
const SEGMENTS: Record<string, string> = {
  '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg',
  '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '',
};

const RECTS: Record<string, [number, number, number, number]> = {
  a: [4, 0, 16, 4], b: [20, 4, 4, 16], c: [20, 24, 4, 16], d: [4, 40, 16, 4],
  e: [0, 24, 4, 16], f: [0, 4, 4, 16], g: [4, 20, 16, 4],
};

function Digit({ ch, x }: { ch: string; x: number }) {
  const on = SEGMENTS[ch] ?? '';
  return (
    <g transform={`translate(${x} 0)`}>
      {Object.entries(RECTS).map(([k, [rx, ry, w, h]]) => (
        <rect key={k} x={rx} y={ry} width={w} height={h} rx={2} fill={on.includes(k) ? '#173a1f' : 'rgba(23,58,31,0.1)'} />
      ))}
    </g>
  );
}

export function SevenSegment({ text }: { text: string }) {
  // text like "05.02": digits and one dot
  const items: { ch: string; dot: boolean }[] = [];
  for (const c of text) {
    if (c === '.' && items.length) items[items.length - 1].dot = true;
    else items.push({ ch: c, dot: false });
  }
  const w = items.length * 32;
  return (
    <svg viewBox={`0 0 ${w} 44`} width={w * 1.1} height={48} role="img" aria-label={text} data-testid="readout" data-value={text}>
      {items.map((it, i) => (
        <g key={i}>
          <Digit ch={it.ch} x={i * 32} />
          <circle cx={i * 32 + 28} cy={42} r={2.5} fill={it.dot ? '#173a1f' : 'rgba(23,58,31,0.1)'} />
        </g>
      ))}
    </svg>
  );
}
