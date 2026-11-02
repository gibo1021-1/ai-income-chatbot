import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AI NEXT | 나에게 맞는 AI 수익화의 시작",
  description:
    "4개의 질문으로 알아보는 나만의 AI 수익화 방향. 1분 무료 진단으로 다음 단계를 찾아보세요.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
