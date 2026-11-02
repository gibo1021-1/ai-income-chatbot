export const CONSENT_VERSION = "2026-11-02-v2";
export const controller =
  process.env.NEXT_PUBLIC_PRIVACY_CONTROLLER?.trim() || "북 브랜딩 랩";
export const retention =
  process.env.NEXT_PUBLIC_PRIVACY_RETENTION?.trim() || "수집일로부터 3년";
export function buildConsentText(operator: string, period: string) {
  return `수집·이용 주체: ${operator}\n목적: 코칭 및 교육을 위한 참고자료 활용, AI 진단 결과에 따른 전화 상담 및 과정 안내\n항목: 이름, 연락처, 진단유형, 추천과정\n보유·이용 기간: ${period}\n동의를 거부할 수 있으며, 거부 시 전화 상담 신청은 불가합니다. 무료 진단과 자료는 계속 이용할 수 있습니다.`;
}
export function buildNewsletterText(operator: string, period: string) {
  return `수집·이용 주체: ${operator}\n목적: 이메일 뉴스레터 발송\n항목: 이름, 이메일\n보유·이용 기간: ${period}\n선택 동의를 거부해도 전화 상담 및 무료 자료 이용에는 영향이 없습니다.`;
}
export const consentText = buildConsentText(controller, retention);
export const newsletterText = buildNewsletterText(controller, retention);
export function validNewsletter(email: string, agreed: boolean) {
  if (
    agreed &&
    (email.length > 254 ||
      !/^[A-Za-z0-9][A-Za-z0-9.!#$%&'*+/?^_`{|}~-]*@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(
        email.trim(),
      ))
  )
    return "뉴스레터를 받으실 이메일 주소를 확인해 주세요.";
  return null;
}
export function collectorUrl(value: string | undefined) {
  return value &&
    /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
      value,
    )
    ? value
    : null;
}
export const consultationEndpoint = collectorUrl(
  process.env.NEXT_PUBLIC_CONSULTATION_ENDPOINT ||
    "https://script.google.com/macros/s/AKfycbyunldSMFZ1YbMKd8LkkDbXYiFKPupxNCOO3H8MppIThuSNyl9U-nXDgvBAN_G75e1avQ/exec",
);
export function validLead(name: string, phone: string, consent: boolean) {
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,39}$/u.test(name.trim()))
    return "이름을 2~40자로 입력해 주세요.";
  if (!/^01[016789]\d{7,8}$/.test(phone.replace(/[\s-]/g, "")))
    return "연락받으실 휴대전화 번호를 확인해 주세요.";
  if (!consent) return "전화 상담을 위한 개인정보 수집·이용에 동의해 주세요.";
  return null;
}
export function trustedCollectorOrigin(origin: string) {
  return (
    origin === "https://script.google.com" ||
    /^https:\/\/(?:[a-z0-9-]+-)?script\.googleusercontent\.com$/.test(origin)
  );
}
