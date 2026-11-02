# AI NEXT — AI 수익화 1분 무료 진단

Next.js App Router · TypeScript · Tailwind CSS로 구현한 한국어 반응형 진단 웹사이트입니다. GitHub Pages에서 배포할 수 있으며 Vercel은 사용하지 않습니다. 답변은 브라우저 메모리에서만 처리하며 서버 전송이나 저장을 하지 않습니다. 새로고침하면 진단은 초기화됩니다. AI 모델 API 호출 없이 네 질문의 규칙 기반 점수로 추천합니다.

## 실행 및 복구

클라우드 작업 환경이 없어져도 **GitHub에 push된 브랜치의 코드와 lockfile**로 복원할 수 있습니다.

```bash
git clone https://github.com/gibo1021-1/ai-income-chatbot.git
cd ai-income-chatbot
git switch feat/ai-income-diagnosis
npm ci
cp .env.example .env.local
npm run dev
```

Node.js 22 이상 권장. 브라우저에서 http://localhost:3000 을 엽니다. PR이 main에 병합되면 `git switch main`으로 실행하세요. 환경 삭제 전에 반드시 push를 완료하고 GitHub 웹에서 파일과 커밋을 확인하세요. 로컬 커밋만으로는 클라우드 삭제에 대비할 수 없습니다.

## 구현 내용

첫 화면과 질문 중에는 유료 과정과 가격을 표시하지 않습니다. 진단 완료 후 추천 유형에 해당하는 과정의 학습 내용·가격·신청 안내만 표시하고, 답변 수정이나 재시작 시 다시 숨깁니다.

- 무료 시작 화면과 버튼형 질문 4개, 선택 전 다음 버튼 비활성화
- 이전 질문 이동, 답변 유지·수정, 결과 확인, 진단 재시작
- 세 유형에 맞춘 강의 소개와 추천 가격
- 1단계 19만 원·2단계 79만 원은 **임시 가격**, 3단계 책 출판 과정은 **299만 원**
- 무료 자료·상담·단계별 외부 결제 링크 설정
- 모바일 반응형, 키보드 포커스, 선택 상태 접근성, 움직임 감소 설정 지원

### 추천 규칙

각 질문의 첫 번째 답변은 도전형, 두 번째는 시스템 구축형, 세 번째는 작가형에 점수를 줍니다. 1·2·4번 질문은 각 1점, 목표를 묻는 3번 질문은 3점입니다. 최고 점수 유형을 추천하며 동점이면 3번 질문의 목표를 우선합니다. 콘텐츠는 `lib/diagnosis.ts`, 화면은 `app/page.tsx`, 스타일은 `app/globals.css`에서 수정합니다. 추천은 참고용이며 실제 수익이나 출판 계약을 보장하지 않습니다.

## 실제 링크 연결

상담 신청은 제공된 카카오톡 채널 `https://pf.kakao.com/_xgrjxaX/chat`에 기본 연결되어 있습니다. 환경변수로 다른 주소를 지정할 수 있으며, 별도 설정 없이 clone해도 상담 링크가 유지됩니다. 무료 자료는 `lib/resources.ts`의 링크 목록으로 관리하고, 결제 주소는 환경변수로 설정합니다. 전자책 1개와 사용자 제공 노션 링크 6개를 등록했습니다. 노션 자료 제목은 사용자가 제공한 이미지의 1~6 순서대로 반영했습니다. 노션 페이지의 외부 방문자 접근 권한은 소유자가 확인해야 합니다.

`.env.example`을 `.env.local`로 복사해 아래 값을 설정하세요. 실제 주소가 없거나 올바른 HTTPS 주소가 아니면 버튼은 **준비 중**으로 표시됩니다. 가짜 결제 페이지로 이동하거나 신청이 완료되었다고 표시하지 않습니다.

| 변수                            | 용도            |
| ------------------------------- | --------------- |
| `NEXT_PUBLIC_CONSULTATION_URL`  | 상담 신청 양식  |
| `NEXT_PUBLIC_PAYMENT_STEP1_URL` | 1단계 외부 결제 |
| `NEXT_PUBLIC_PAYMENT_STEP2_URL` | 2단계 외부 결제 |
| `NEXT_PUBLIC_PAYMENT_STEP3_URL` | 3단계 외부 결제 |

이 변수는 클라이언트에 공개되므로 비밀키를 넣지 마세요. 변경 후 개발 서버 재시작 또는 `npm run build`가 필요합니다. 실제 결제·상담·자료 수령은 연결한 외부 서비스에서 처리합니다. 외부 서비스의 실제 결제 완료 흐름은 URL이 제공된 후 별도 확인해야 합니다. `.env.local`은 Git에 저장하지 않습니다.

## 검증

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

시스템 Chromium이 이미 설치되어 있으면 `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`로 실행합니다. E2E는 프로덕션 빌드의 로컬 서버를 사용합니다. 배포 명령은 실행하지 않습니다.

## 코드 보존 확인

1. GitHub 저장소에서 브랜치 `feat/ai-income-diagnosis`를 선택합니다.
2. `app/page.tsx`, `lib/diagnosis.ts`, `package-lock.json`, `tests/`가 있는지 확인합니다.
3. Commits에서 최신 커밋을 열고 변경 파일을 확인합니다. PR의 Files changed에서도 확인할 수 있습니다.
4. 새 폴더에 clone한 후 위 복구 절차로 실행하면 원격 보존 여부까지 확인할 수 있습니다.

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/feat/ai-income-diagnosis
git status --short
```

앞의 두 SHA가 같고 상태 출력이 비어 있으면 현재 브랜치가 원격과 일치합니다. 별도 백업은 `git bundle create ai-income-chatbot.bundle --all`로 만들 수 있고, 다른 컴퓨터에서 `git clone ai-income-chatbot.bundle`로 복구할 수 있습니다.

## GitHub Pages 배포

사용자의 후속 요청에 따라 GitHub Pages 배포를 준비했습니다. Vercel 자동 배포는 계속 비활성화되어 있습니다.

1. 비공개 저장소는 GitHub Pro 이상이 필요합니다. 무료 계정이면 Settings → General → Danger Zone → Change repository visibility에서 Public으로 변경해야 합니다. **이 경우 소스 코드와 Git 기록이 공개되므로 소유자의 명시적인 동의가 필요합니다.**
2. PR #1을 main에 병합합니다.
3. 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 선택합니다.
4. Actions → Deploy GitHub Pages → Run workflow → main을 선택해 실행합니다. 이후 main에 push하면 자동 갱신합니다.
5. 배포 성공 후 `https://gibo1021-1.github.io/ai-income-chatbot/`을 공유합니다. 배포 완료 전에는 이 주소가 열리지 않을 수 있습니다.

결제 링크는 Settings → Secrets and variables → Actions → Variables에 `.env.example`과 같은 이름으로 추가한 뒤 워크플로를 재실행하세요. 상담은 제공된 카카오 주소를 기본값으로 사용합니다.

Pages용으로 `GITHUB_PAGES=true npm run build`를 실행하면 `out/`에 정적 파일이 생성됩니다. `/ai-income-chatbot/` 하위 경로의 스타일·스크립트·홈 링크를 지원합니다. 일반 로컬 실행은 `npm run dev` 또는 `npm run build && npm run start`입니다.

[Pages 설정 열기](https://github.com/gibo1021-1/ai-income-chatbot/settings/pages) · [PR 열기](https://github.com/gibo1021-1/ai-income-chatbot/pull/1)
