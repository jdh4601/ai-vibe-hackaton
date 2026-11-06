import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogueBox } from '../../src/ui/dialogue/DialogueBox';
import { useDialogueStore } from '../../src/stores/useDialogueStore';

const lines = [
  { speaker: '납땜 선배', text: '안녕!' },
  { speaker: '납땜 선배', text: '도와줄래?' },
];

beforeEach(() => {
  vi.useFakeTimers();
  useDialogueStore.getState().reset();
});
afterEach(() => vi.useRealTimers());

describe('DialogueBox', () => {
  it('render_noScript_rendersNothing', () => {
    const { container } = render(<DialogueBox />);
    expect(container).toBeEmptyDOMElement();
  });

  it('typing_30msPerChar_revealsTextProgressively', () => {
    act(() => useDialogueStore.getState().play({ voicePitch: 220, lines }));
    render(<DialogueBox />);
    expect(screen.getByText('납땜 선배')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(30));
    expect(screen.queryByText('▼')).toBeNull();
    act(() => void vi.advanceTimersByTime(120));
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('click_whileTyping_completesThenNextClickAdvances', () => {
    act(() => useDialogueStore.getState().play({ voicePitch: 220, lines }));
    render(<DialogueBox />);
    fireEvent.click(screen.getByTestId('dialogue-box'));
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(useDialogueStore.getState().index).toBe(0);
    fireEvent.click(screen.getByTestId('dialogue-box'));
    expect(useDialogueStore.getState().index).toBe(1);
  });

  it('space_onLastLineWithoutChoices_endsDialogue', () => {
    act(() => useDialogueStore.getState().play({ voicePitch: 220, lines: [lines[0]] }));
    render(<DialogueBox />);
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'Space' });
    expect(useDialogueStore.getState().script).toBeNull();
  });

  it('lastLineWithChoices_showsButtonsAndChooseIsCalled', () => {
    const choose = vi.fn();
    useDialogueStore.setState({ choose });
    act(() =>
      useDialogueStore.getState().play({
        voicePitch: 220,
        lines: [lines[1]],
        choices: [
          { id: 'accept', label: '도와준다' },
          { id: 'decline', label: '다음에' },
        ],
      }),
    );
    render(<DialogueBox />);
    expect(screen.queryByText('도와준다')).toBeNull();
    fireEvent.click(screen.getByTestId('dialogue-box'));
    fireEvent.click(screen.getByText('도와준다'));
    expect(choose).toHaveBeenCalledWith('accept');
    expect(screen.getByText('다음에')).toBeInTheDocument();
  });
});
