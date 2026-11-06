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

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setCount(n);
      if (text[n - 1] !== ' ') onCharRef.current?.();
      if (n >= text.length) stop();
    }, msPerChar);
    return stop;
  }, [text, msPerChar, stop]);

  // stop the timer too, otherwise its next tick rewinds the text to where typing had reached
  const complete = useCallback(() => {
    stop();
    setCount(text.length);
  }, [text, stop]);
  return { shown: text.slice(0, count), done: count >= text.length, complete };
}
