import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { voltageToAngle } from '../../src/logic/minigames/dial';
import { DialGame } from '../../src/ui/minigames/DialGame';
import { PREVIEW_SPECS } from '../../src/ui/minigames/previewSpecs';

const spec = PREVIEW_SPECS.dial.spec;
if (spec.kind !== 'dial') throw new Error('bad spec');

function turnTo(volts: number) {
  const knob = screen.getByTestId('dial-knob');
  const steps = Math.round(voltageToAngle(volts));
  for (let i = 0; i < steps; i++) fireEvent.keyDown(knob, { key: 'ArrowRight' });
}

describe('DialGame', () => {
  it('holdTargets_bothStages_callsOnSuccess', async () => {
    const onSuccess = vi.fn();
    render(<DialGame spec={spec} hintVisible={false} onSuccess={onSuccess} onFail={() => {}} />);
    expect(screen.getByTestId('dial-stage')).toHaveTextContent('5.0V');
    turnTo(5);
    await waitFor(() => expect(screen.getByTestId('dial-lock')).toHaveTextContent('LOCK'), { timeout: 2500 });
    await waitFor(() => expect(screen.getByTestId('dial-stage')).toHaveTextContent('3.3V'), { timeout: 2500 });
    turnTo(3.3);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1), { timeout: 4000 });
  }, 12000);

  it('hintVisible_showsTargetBand', () => {
    const { rerender } = render(<DialGame spec={spec} hintVisible={false} onSuccess={() => {}} onFail={() => {}} />);
    expect(screen.queryByTestId('dial-band')).toBeNull();
    rerender(<DialGame spec={spec} hintVisible onSuccess={() => {}} onFail={() => {}} />);
    expect(screen.getByTestId('dial-band')).toBeInTheDocument();
  });

  it('knobAtZero_readoutShowsZeroVolts', () => {
    render(<DialGame spec={spec} hintVisible={false} onSuccess={() => {}} onFail={() => {}} />);
    expect(screen.getByTestId('readout').dataset.value).toBe('00.00');
  });
});
