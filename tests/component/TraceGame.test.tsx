import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { cupStrokes } from '../../src/logic/minigames/trace';
import { PREVIEW_SPECS } from '../../src/ui/minigames/previewSpecs';
import { TraceGame } from '../../src/ui/minigames/TraceGame';

const spec = PREVIEW_SPECS.trace.spec;
if (spec.kind !== 'trace') throw new Error('bad spec');

function drawAll() {
  const canvas = screen.getByTestId('trace-canvas');
  for (const stroke of cupStrokes()) {
    fireEvent.pointerDown(canvas, { clientX: stroke[0].x, clientY: stroke[0].y });
    for (const p of stroke) fireEvent.pointerMove(canvas, { clientX: p.x, clientY: p.y });
    fireEvent.pointerUp(canvas);
  }
}

describe('TraceGame', () => {
  it('traceCupThenSubmit_passes_callsOnSuccess', async () => {
    const onSuccess = vi.fn();
    render(<TraceGame spec={spec} hintVisible={false} onSuccess={onSuccess} onFail={() => {}} />);
    drawAll();
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(screen.getByTestId('trace-score')).toHaveTextContent('일치율 100%');
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1), { timeout: 2000 });
  });

  it('submitEmpty_callsOnFail', () => {
    const onFail = vi.fn();
    render(<TraceGame spec={spec} hintVisible={false} onSuccess={() => {}} onFail={onFail} />);
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/불합격/)).toBeInTheDocument();
  });

  it('clear_removesDrawing', () => {
    const onFail = vi.fn();
    render(<TraceGame spec={spec} hintVisible={false} onSuccess={() => {}} onFail={onFail} />);
    drawAll();
    fireEvent.click(screen.getByRole('button', { name: '지우기' }));
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('hintVisible_guideStrokesAreBolder', () => {
    const { rerender } = render(<TraceGame spec={spec} hintVisible={false} onSuccess={() => {}} onFail={() => {}} />);
    const w0 = Number(screen.getAllByTestId('trace-guide')[0].getAttribute('stroke-width'));
    rerender(<TraceGame spec={spec} hintVisible onSuccess={() => {}} onFail={() => {}} />);
    expect(Number(screen.getAllByTestId('trace-guide')[0].getAttribute('stroke-width'))).toBeGreaterThan(w0);
  });
});
