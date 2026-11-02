export const GOAL_QUESTION_INDEX = 6;
export const BLOCKER_QUESTION_INDEX = 2;
export const questions = [
  {
    title: "지금 나의 출발점은 어디인가요?",
    hint: "현재 모습에 가장 가까운 답을 골라 주세요.",
    options: [
      "AI로 무언가 해 보고 싶지만 아직 시작 전이에요",
      "콘텐츠나 채널을 운영하며 수익화를 시도하고 있어요",
      "한 분야의 경험과 지식을 꾸준히 쌓아 왔어요",
    ],
    weight: 1,
  },
  {
    title: "지금까지 해 본 시도는 무엇인가요?",
    hint: "잘한 일보다 직접 해 본 경험을 떠올려 보세요.",
    options: [
      "AI에게 질문해 봤지만 결과물을 완성하진 못했어요",
      "글·영상·상품을 만들었지만 반응이 일정하지 않아요",
      "전문 지식을 글이나 강의로 나눴지만 체계화하진 못했어요",
    ],
    weight: 1,
  },
  {
    title: "혼자 하다 가장 자주 멈추는 순간은?",
    hint: "최근 시작을 미루거나 작업을 멈췄던 이유를 생각해 보세요.",
    options: [
      "무엇부터 해야 할지 몰라 검색만 하다가 멈춰요",
      "만들기는 하는데 고객과 수익으로 이어지지 않아요",
      "할 이야기는 많은데 목차와 원고로 정리가 안 돼요",
    ],
    weight: 2,
  },
  {
    title: "그 막힘 때문에 어떤 일이 반복되나요?",
    hint: "지금 바꾸고 싶은 반복 패턴을 골라 주세요.",
    options: [
      "자료와 도구는 모으는데 내 결과물은 쌓이지 않아요",
      "매번 새로 기획하느라 꾸준한 운영이 어려워요",
      "경험을 그때그때 설명하지만 대표 콘텐츠로 남기지 못해요",
    ],
    weight: 1,
  },
  {
    title: "다른 사람에게 줄 수 있는 가치는 무엇일까요?",
    hint: "대단한 경력보다 누군가에게 도움이 된 경험을 떠올려 보세요.",
    options: [
      "아직은 잘 모르겠어요. 작은 경험부터 찾아보고 싶어요",
      "내 콘텐츠나 상품에 관심을 보인 사람이 있어요",
      "사람들이 자주 물어보는 전문 지식과 경험이 있어요",
    ],
    weight: 1,
  },
  {
    title: "혼자 해결하기 어렵다면 어떤 도움이 필요한가요?",
    hint: "누가 옆에서 도와준다면 가장 먼저 부탁할 일을 골라 주세요.",
    options: [
      "내 수준에 맞는 순서와 첫 결과물을 만드는 실습",
      "브랜드·콘텐츠·상품·판매를 연결하는 전체 설계",
      "내 경험을 책의 기획·목차·원고로 완성하는 집필 과정",
    ],
    weight: 2,
  },
  {
    title: "앞으로 3개월, 어떤 변화를 만들고 싶나요?",
    hint: "모두 잘하기보다 가장 먼저 이루고 싶은 목표 하나를 골라 주세요.",
    options: [
      "작은 결과물을 완성하고 첫 수익화 실험을 해 보고 싶어요",
      "내 브랜드와 상품이 이어지는 수익 구조를 만들고 싶어요",
      "내 전문성을 담은 책과 작가 브랜드의 기반을 만들고 싶어요",
    ],
    weight: 3,
  },
  {
    title: "지금 나에게 가장 필요한 다음 한 걸음은?",
    hint: "목표를 실제 행동으로 바꾼다면 무엇부터 할까요?",
    options: [
      "도구 탐색을 줄이고 작은 콘텐츠·상품 하나를 완성하기",
      "흩어진 활동을 정리하고 고객이 구매까지 가는 흐름 설계하기",
      "쌓인 경험을 한 가지 주제로 묶고 출판 기획과 목차 만들기",
    ],
    weight: 2,
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
    answers.length !== questions.length ||
    Array.from(answers).some((a) => !Number.isInteger(a) || a < 0 || a > 2)
  )
    throw new Error("모든 질문에 답해 주세요.");
  const scores = [0, 0, 0];
  answers.forEach((a, i) => {
    scores[a] += questions[i].weight;
  });
  const max = Math.max(...scores);
  return scores[answers[GOAL_QUESTION_INDEX]] === max
    ? answers[GOAL_QUESTION_INDEX]
    : scores.indexOf(max);
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
  consultation: safeUrl(
    process.env.NEXT_PUBLIC_CONSULTATION_URL ||
      "https://pf.kakao.com/_xgrjxaX/chat",
  ),
  payments: [
    safeUrl(process.env.NEXT_PUBLIC_PAYMENT_STEP1_URL),
    safeUrl(process.env.NEXT_PUBLIC_PAYMENT_STEP2_URL),
    safeUrl(process.env.NEXT_PUBLIC_PAYMENT_STEP3_URL),
  ],
};
