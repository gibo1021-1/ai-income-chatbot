export const questions = [
  {
    title: "AI와 지금 얼마나 친한가요?",
    hint: "가장 가까운 현재 모습을 골라 주세요.",
    options: [
      "아직 낯설어요. 처음부터 배우고 싶어요",
      "가끔 써 봤지만 수익으로 연결하진 못했어요",
      "콘텐츠나 업무에 꾸준히 활용하고 있어요",
    ],
  },
  {
    title: "지금 가지고 있는 자산은 무엇인가요?",
    hint: "규모보다 지금의 경험이 중요해요.",
    options: [
      "새로운 일을 시작하려는 의지와 호기심",
      "운영 중인 채널이나 판매해 본 상품",
      "오래 쌓아 온 전문 지식과 나만의 이야기",
    ],
  },
  {
    title: "AI로 가장 이루고 싶은 것은?",
    hint: "가장 먼저 이루고 싶은 목표 하나를 골라 주세요.",
    options: [
      "작더라도 나의 첫 수익 만들기",
      "나만의 브랜드와 꾸준한 수익 구조 만들기",
      "전문성을 책으로 정리하고 작가로 활동하기",
    ],
  },
  {
    title: "어떤 방식으로 시작하고 싶나요?",
    hint: "지금 나에게 맞는 속도로 시작해요.",
    options: [
      "기초부터 배우며 작은 결과물을 완성할래요",
      "콘텐츠·상품·판매 흐름을 연결하고 싶어요",
      "기획부터 원고까지 책 한 권을 완성하고 싶어요",
    ],
  },
];
export const courses = [
  {
    title: "AI 첫 수익화 도전형",
    short: "나의 첫 수익 만들기",
    label: "STARTER",
    step: "01",
    price: "19만 원",
    provisional: true,
    description:
      "처음이어도 괜찮아요. AI 도구를 익히고 작은 콘텐츠와 상품으로 첫 수익화 실험을 시작해 보세요.",
    items: [
      "AI 도구 기초와 실전 프롬프트",
      "나에게 맞는 수익화 주제 찾기",
      "첫 콘텐츠·디지털 상품 제작",
    ],
    action: "AI 첫 수익화 입문 과정",
  },
  {
    title: "AI 브랜드·수익 시스템 구축형",
    short: "브랜드를 수익 시스템으로",
    label: "BUILDER",
    step: "02",
    price: "79만 원",
    provisional: true,
    description:
      "흩어진 경험과 콘텐츠를 하나의 브랜드로 연결해요. 상품과 고객 동선을 설계하며 지속 가능한 수익 구조를 만들어 보세요.",
    items: [
      "브랜드 포지셔닝과 콘텐츠 전략",
      "유료 상품과 고객 동선 설계",
      "AI를 활용한 반복 업무 시스템화",
    ],
    action: "AI 브랜드·수익 시스템 과정",
  },
  {
    title: "전문성 브랜드·작가형",
    short: "나의 전문성을 한 권의 책으로",
    label: "AUTHOR",
    step: "03",
    price: "299만 원",
    provisional: false,
    description:
      "쌓아 온 지식과 이야기를 책으로 정리해요. AI를 집필 파트너로 활용해 전문성을 담은 작가 브랜드를 준비합니다.",
    items: [
      "전문성 기반 출판 기획과 목차",
      "AI 협업 원고 작성과 퇴고",
      "책 출판 준비와 작가 브랜드 설계",
    ],
    action: "전문성 브랜드·책 출판 과정",
  },
];
export function diagnose(answers: number[]) {
  if (
    answers.length !== 4 ||
    answers.some((a) => !Number.isInteger(a) || a < 0 || a > 2)
  )
    throw new Error("네 질문에 모두 답해 주세요.");
  const scores = [0, 0, 0];
  answers.forEach((a, i) => {
    scores[a] += i === 2 ? 3 : 1;
  });
  const max = Math.max(...scores);
  return scores[answers[2]] === max ? answers[2] : scores.indexOf(max);
}
export function safeUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
export const links = {
  resource: safeUrl(process.env.NEXT_PUBLIC_RESOURCE_URL),
  consultation: safeUrl(process.env.NEXT_PUBLIC_CONSULTATION_URL),
  payments: [
    safeUrl(process.env.NEXT_PUBLIC_PAYMENT_STEP1_URL),
    safeUrl(process.env.NEXT_PUBLIC_PAYMENT_STEP2_URL),
    safeUrl(process.env.NEXT_PUBLIC_PAYMENT_STEP3_URL),
  ],
};
