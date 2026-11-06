import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdmissionLetter } from '../../src/ui/overlays/AdmissionLetter';

describe('AdmissionLetter', () => {
  it('render_default_showsCongratulation', () => {
    render(<AdmissionLetter onNext={() => undefined} />);
    expect(screen.getByText('인천대학교 자유전공학부 27학번 입학을 축하합니다.')).toBeInTheDocument();
  });

  it('click_anywhere_callsOnNext', () => {
    const onNext = vi.fn();
    render(<AdmissionLetter onNext={onNext} />);
    fireEvent.click(screen.getByTestId('admission-letter'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
