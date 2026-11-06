import type { DialogueChoice, DialogueChoiceId } from '../../game/types';

interface Props {
  choices: DialogueChoice[];
  onChoose: (id: DialogueChoiceId) => void;
}

export function ChoiceButtons({ choices, onChoose }: Props) {
  return (
    <div className="dlg-choices" role="group" aria-label="선택지">
      {choices.map((c) => (
        <button
          key={c.id}
          className={`dlg-choice ${c.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onChoose(c.id);
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
