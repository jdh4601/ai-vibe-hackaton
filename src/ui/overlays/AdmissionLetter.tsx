import '../hud/hud.css';
import './overlays.css';

// Fictional emblem (wave + sun over a shield) - deliberately not the real university logo.
export function Emblem() {
  return (
    <svg className="emblem" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 4 L90 18 V50 C90 74 72 90 50 97 C28 90 10 74 10 50 V18 Z" fill="#1d2a4f" stroke="#d8b24a" strokeWidth="3" />
      <circle cx="50" cy="38" r="13" fill="#f6c945" />
      <path d="M18 62 Q30 52 42 62 T66 62 T86 60" fill="none" stroke="#8fd0ff" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 76 Q34 66 46 76 T70 76 T80 74" fill="none" stroke="#5aa9e6" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function AdmissionLetter({ onNext }: { onNext: () => void }) {
  return (
    <div className="ov letter-bg ui-root" onClick={onNext} data-testid="admission-letter">
      <div className="letter">
        <Emblem />
        <div className="l-school">인 천 대 학 교</div>
        <h2 className="l-title">합격을 축하합니다</h2>
        <p className="l-body">인천대학교 자유전공학부 27학번 입학을 축하합니다.</p>
        <div className="l-sign">2027학년도 신입생 입학처</div>
        <div className="l-hint">클릭해서 계속</div>
      </div>
    </div>
  );
}
