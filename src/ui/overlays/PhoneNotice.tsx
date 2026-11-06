import '../hud/hud.css';
import './overlays.css';

export function PhoneNotice({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="ov op-room ui-root" onClick={onOpen} data-testid="phone-notice">
      <div className="phone">
        <div className="phone-screen">
          <div className="phone-time">7:30</div>
          <div className="phone-date">2027년 3월 2일 화요일</div>
          <div className="sms" role="button" aria-label="문자 열기">
            <div className="sms-app"><span>💬 메시지</span><span>지금</span></div>
            <div className="sms-title">[인천대학교] 2027학년도 합격자 안내</div>
            <div className="sms-body">자유전공학부 합격을 축하합니다. 자세한 내용을 확인해 주세요.</div>
          </div>
          <div className="phone-tap">문자를 눌러 확인하기</div>
        </div>
      </div>
    </div>
  );
}
