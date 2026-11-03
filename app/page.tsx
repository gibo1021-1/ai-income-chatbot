"use client";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Sparkles,
  Check,
  Clock3,
  ShieldCheck,
  RotateCcw,
  Download,
} from "lucide-react";
import {
  courses,
  diagnose,
  links,
  questions,
  BLOCKER_QUESTION_INDEX,
} from "../lib/diagnosis";
import ConsultationForm from "../components/ConsultationForm";
import { freeResources } from "../lib/resources";
const homeHref = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`;
function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return href ? (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={17} />
    </a>
  ) : (
    <span className={`${className} unavailable`} aria-disabled="true">
      {children} · 준비 중
    </span>
  );
}
export default function Home() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  function move(next: number) {
    setStep(next);
    setResult(false);
    requestAnimationFrame(() => {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      panel.current?.focus({ preventScroll: true });
    });
  }
  function restart() {
    setAnswers([]);
    move(-1);
  }
  const type = result ? diagnose(answers) : 0;
  const course = courses[type];
  return (
    <>
      <header className="header">
        <a href={homeHref} className="brand" aria-label="AI NEXT 홈">
          <span className="brand-icon">
            <Sparkles size={21} />
          </span>
          AI NEXT<span className="brand-dot">.</span>
        </a>
        <nav aria-label="주요 메뉴">
          <a href="#journey">성장 로드맵</a>
          <a href="#diagnosis">{result ? "추천 과정" : "무료 진단"}</a>
          <ExternalLink href={links.consultation} className="nav-consult">
            상담 신청
          </ExternalLink>
        </nav>
      </header>
      <main>
        <section className="hero" aria-label="AI 수익화 무료 진단">
          <div className="hero-copy">
            <span className="eyebrow">
              <span /> 나에게 맞는 AI 시작
            </span>
            <h1>
              AI로 만드는 수익,
              <br />
              시작은 <em>나를 아는 것</em>부터.
            </h1>
            <p className="hero-description">
              무엇부터 시작해야 할지 막막하다면?
              <br />
              지금의 경험과 목표에 맞는 나만의 AI 수익화 방향을 찾아보세요.
            </p>
            <div className="hero-facts">
              <span>
                <Clock3 size={16} /> 약 2분
              </span>
              <span>
                <Check size={16} /> 질문 {questions.length}개
              </span>
              <span>
                <ShieldCheck size={16} /> 무료 · 가입 없이
              </span>
            </div>
            <a href="#diagnosis" className="text-link">
              내 가능성 발견하기 <ArrowRight size={17} />
            </a>
            <a href="#free-resources" className="hero-resource-link">
              <Download size={17} />
              <span>
                전자책 + 실전 자료{" "}
                <strong>{freeResources.length}종 무료로 보기</strong>
              </span>
              <ArrowRight size={16} />
            </a>
            <div className="hero-note">
              <span className="mini-stars">✦ ✦ ✦</span> 누구에게나, 자신만의
              시작점이 있으니까요.
            </div>
          </div>
          <div
            className="diagnosis-card"
            id="diagnosis"
            ref={panel}
            tabIndex={-1}
          >
            {step === -1 ? (
              <>
                <div className="card-top">
                  <span className="pill">무료 수익화 진단</span>
                  <span className="small-muted">
                    01 — {String(questions.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="orb">
                  <Sparkles size={39} strokeWidth={1.4} />
                  <span className="orbit o1" />
                  <span className="orbit o2" />
                  <span className="orb-dot" />
                </div>
                <span className="card-kicker">나의 가능성을 발견하는 시간</span>
                <h2>
                  AI 수익화
                  <br />
                  무료 진단
                </h2>
                <p>
                  여덟 가지 질문에 답하고
                  <br />
                  나에게 맞는 다음 단계를 만나보세요.
                </p>
                <button className="primary" onClick={() => move(0)}>
                  무료 진단 시작하기 <ArrowRight size={20} />
                </button>
                <span className="card-foot">
                  정답은 없어요. 지금의 나를 편하게 골라 주세요.
                </span>
              </>
            ) : result ? (
              <>
                <div className="card-top">
                  <span className="pill">나에게 맞는 다음 단계</span>
                  <Sparkles size={20} />
                </div>
                <span className="result-label">나에게 추천하는 방향</span>
                <h2 className="result-title">{course.title}</h2>
                <div className="need-summary">
                  <span>답변에서 짚어 본 나의 고민</span>
                  <p>
                    “
                    {
                      questions[BLOCKER_QUESTION_INDEX].options[
                        answers[BLOCKER_QUESTION_INDEX]
                      ]
                    }
                    ”
                  </p>
                </div>
                <p>{course.description}</p>
                <div className="result-box">
                  <span>추천 과정 · {Number(course.step)}단계</span>
                  <strong>{course.action}</strong>
                  <ul
                    className="result-curriculum"
                    aria-label="추천 과정 학습 내용"
                  >
                    {course.items.map((item) => (
                      <li key={item}>
                        <Check size={14} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <b>{course.price}</b>
                </div>
                <ConsultationForm type={type} />
                <div className="result-actions">
                  <button onClick={() => move(0)}>
                    <ArrowLeft size={15} /> 답변 수정
                  </button>
                  <button onClick={restart}>
                    <RotateCcw size={15} /> 진단 재시작
                  </button>
                </div>
                <span className="card-foot">
                  자가 진단에 따른 참고용 추천이며 수익을 보장하지 않습니다.
                </span>
              </>
            ) : (
              <>
                <div className="card-top">
                  <span className="pill">나를 알아보는 질문</span>
                  <span className="small-muted">
                    {String(step + 1).padStart(2, "0")} /{" "}
                    {String(questions.length).padStart(2, "0")}
                  </span>
                </div>
                <div
                  className="progress"
                  aria-label={`질문 ${step + 1}/${questions.length}`}
                >
                  <span
                    style={{
                      width: `${((step + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="question-number">질문 {step + 1}</span>
                <h2 className="question-title">{questions[step].title}</h2>
                <p className="question-hint">{questions[step].hint}</p>
                <div
                  className="options"
                  role="group"
                  aria-label={questions[step].title}
                >
                  {questions[step].options.map((option, i) => (
                    <button
                      key={option}
                      aria-pressed={answers[step] === i}
                      className={answers[step] === i ? "selected" : ""}
                      onClick={() =>
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[step] = i;
                          return next;
                        })
                      }
                    >
                      <span>{String.fromCharCode(65 + i)}</span>
                      {option}
                      {answers[step] === i && <Check size={18} />}
                    </button>
                  ))}
                </div>
                <div className="question-actions">
                  <button className="back" onClick={() => move(step - 1)}>
                    <ArrowLeft size={17} /> 이전
                  </button>
                  <button
                    className="primary"
                    disabled={answers[step] === undefined}
                    onClick={() => {
                      if (step === questions.length - 1) {
                        setResult(true);
                        requestAnimationFrame(() => panel.current?.focus());
                      } else move(step + 1);
                    }}
                  >
                    {step === questions.length - 1
                      ? "진단 결과 보기"
                      : "다음 질문"}
                    <ArrowRight size={18} />
                  </button>
                </div>
                <button className="restart" onClick={restart}>
                  처음부터 다시 시작
                </button>
              </>
            )}
          </div>
        </section>
        <section id="journey" className="journey">
          <div>
            <span className="eyebrow">나에게 맞는 속도로 시작하세요</span>
            <h2>
              출발점은 달라도,
              <br className="mobile-break" /> 가능성은 열려 있어요.
            </h2>
          </div>
          <p>
            처음 도전하는 분부터 나만의 책을 꿈꾸는 분까지.
            <br />
            지금 나에게 필요한 한 걸음을 함께 찾아요.
          </p>
        </section>
        <section
          id="free-resources"
          className="resource-showcase"
          aria-labelledby="free-resources-title"
        >
          <div className="resource-showcase-header">
            <div>
              <span className="resource-badge">
                <Download size={15} /> 무료 자료 {freeResources.length}종
              </span>
              <h2 id="free-resources-title">
                AI 시작이 막막할 때,
                <br />
                무료 자료부터 만나보세요.
              </h2>
              <p>
                AI 입문 전자책부터 인스타·릴스·블로그 실전 자료까지.
                <br />
                지금 필요한 자료를 골라 바로 열어보세요.
              </p>
            </div>
            <div
              className="resource-count"
              aria-label={`총 ${freeResources.length}개 무료 자료`}
            >
              <strong>{String(freeResources.length).padStart(2, "0")}</strong>
              <span>가지 무료 자료</span>
              <p>
                입문 전자책 1개
                <br />
                실전 자료 {freeResources.length - 1}개
              </p>
            </div>
          </div>
          <ul className="resource-links" aria-label="무료 자료 링크 목록">
            {freeResources.map((resource, index) => (
              <li
                key={resource.url}
                className={index === 0 ? "featured-resource" : ""}
              >
                <a
                  href={resource.url}
                  className="resource-card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="resource-card-label">
                    {index === 0
                      ? "AI 입문 전자책"
                      : `실전 자료 ${String(index).padStart(2, "0")}`}
                  </span>
                  <strong>{resource.title}</strong>
                  <span className="resource-description">
                    {resource.description}
                  </span>
                  <span className="resource-card-action">
                    무료로 자료 열기 <ArrowUpRight size={17} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="resource-link-note">
            진단 전에도 자유롭게 이용할 수 있어요. 자료는 외부 페이지에서 새
            창으로 열립니다.
          </p>
        </section>
        {result && (
          <div className="notice">
            강의 상세 일정과 제공 범위, 외부 신청 페이지의 결제 조건은 신청 전
            확인해 주세요.
          </div>
        )}
      </main>
      <footer>
        <a href={homeHref} className="brand">
          AI NEXT<span className="brand-dot">.</span>
        </a>
        <span>당신의 경험이, 새로운 가능성이 되도록.</span>
        <span>© {new Date().getFullYear()} AI NEXT</span>
      </footer>
    </>
  );
}
