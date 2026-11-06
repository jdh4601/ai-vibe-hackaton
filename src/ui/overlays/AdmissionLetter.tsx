import schoolLogo from '../../../assets/logo/logo.png';
import '../hud/hud.css';
import './overlays.css';

// University seal from assets/logo (uploaded by the team for the admission letter).
export function Emblem() {
  return <img className="emblem" src={schoolLogo} alt="인천대학교 로고" />;
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
