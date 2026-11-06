import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FillBlankGame } from '../../src/ui/minigames/FillBlankGame';
import { PREVIEW_SPECS } from '../../src/ui/minigames/previewSpecs';

const spec = PREVIEW_SPECS.fillBlank.spec;
if (spec.kind !== 'fillBlank') throw new Error('bad spec');

describe('FillBlankGame', () => {
  it('pickCorrect_threeRounds_callsOnSuccess', async () => {
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    render(<FillBlankGame spec={spec} hintVisible={false} onSuccess={onSuccess} onFail={onFail} />);
    for (let i = 0; i < 3; i++) {
      await waitFor(() => expect(screen.getByTestId('fb-round')).toHaveTextContent(`라운드 ${i + 1} / 3`), { timeout: 2000 });
      fireEvent.click(screen.getByTestId(`tile-${spec.rounds[i].answer}`));
    }
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(onFail).not.toHaveBeenCalled();
  });

  it('pickWrong_callsOnFailAndStaysOnRound', () => {
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    render(<FillBlankGame spec={spec} hintVisible={false} onSuccess={onSuccess} onFail={onFail} />);
    fireEvent.click(screen.getByTestId('tile-14'));
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('fb-round')).toHaveTextContent('라운드 1 / 3');
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
