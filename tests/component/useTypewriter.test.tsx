import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useTypewriter } from '../../src/ui/dialogue/useTypewriter';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('complete_midTyping_staysCompleteAfterLaterTicks', () => {
  const { result } = renderHook(() => useTypewriter('안녕하세요 선배님', undefined, 30));
  act(() => vi.advanceTimersByTime(60));
  expect(result.current.done).toBe(false);
  act(() => result.current.complete());
  act(() => vi.advanceTimersByTime(300));
  expect(result.current.done).toBe(true);
  expect(result.current.shown).toBe('안녕하세요 선배님');
});
