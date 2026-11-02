export const CONSENT_VERSION = "2026-11-02-v1";
export const controller =
  process.env.NEXT_PUBLIC_PRIVACY_CONTROLLER?.trim() || "";
export const retention =
  process.env.NEXT_PUBLIC_PRIVACY_RETENTION?.trim() || "";
export const consentText =
  controller && retention
    ? `수집·이용 주체: ${controller}\n목적: AI 진단 결과에 따른 전화 상담 및 과정 안내\n항목: 이름, 연락처, 진단유형, 추천과정\n보유·이용 기간: ${retention}\n동의를 거부할 수 있으며, 거부 시 전화 상담 신청은 불가합니다. 무료 진단과 자료는 계속 이용할 수 있습니다.`
    : "";
export function collectorUrl(value: string | undefined) {
  return value &&
    /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
      value,
    )
    ? value
    : null;
}
export const consultationEndpoint = collectorUrl(
  process.env.NEXT_PUBLIC_CONSULTATION_ENDPOINT,
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
