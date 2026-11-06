import { useCallback, useEffect, useRef, useState } from 'react';

export const TYPE_MS_PER_CHAR = 30;

export interface Typewriter {
  shown: string;
  done: boolean;
  complete: () => void;
}

// Reveals `text` one character per 30ms. onChar fires for each newly revealed non-space char.
export function useTypewriter(text: string, onChar?: () => void, msPerChar = TYPE_MS_PER_CHAR): Typewriter {
  const [count, setCount] = useState(0);
  const onCharRef = useRef(onChar);
  onCharRef.current = onChar;

  useEffect(() => {
    setCount(0);
    if (!text) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (text[n - 1] !== ' ') onCharRef.current?.();
      if (n >= text.length) clearInterval(id);
    }, msPerChar);
    return () => clearInterval(id);
  }, [text, msPerChar]);

  const complete = useCallback(() => setCount(text.length), [text]);
  return { shown: text.slice(0, count), done: count >= text.length, complete };
}
