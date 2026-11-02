"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  CONSENT_VERSION,
  consultationEndpoint,
  consentText,
  trustedCollectorOrigin,
  validLead,
} from "../lib/consultation";
import { courses, links } from "../lib/diagnosis";

export default function ConsultationForm({ type }: { type: number }) {
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const requestId = useRef("");
  const completed = useRef(false);
  const submittedDetails = useRef("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ready = Boolean(consultationEndpoint && consentText);
  const pending = status === "pending";
  useEffect(() => {
    function receive(event: MessageEvent) {
      const data = event.data;
      if (
        completed.current ||
        !trustedCollectorOrigin(event.origin) ||
        !requestId.current ||
        data?.source !== "ai-next-consultation" ||
        data?.requestId !== requestId.current ||
        !["success", "error"].includes(data?.status)
      )
        return;
      if (timeout.current) clearTimeout(timeout.current);
      if (data.status === "success") {
        completed.current = true;
        submittedDetails.current = "";
        setStatus("success");
        form.current?.reset();
      } else {
        setStatus("error");
        setError(
          "접수를 완료하지 못했습니다. 잠시 후 다시 시도하거나 카카오톡으로 문의해 주세요.",
        );
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  if (status === "success")
    return (
      <section className="consultation-success" role="status">
        <h3>상담 신청이 접수되었습니다</h3>
        <p>
          남겨주신 연락처로 담당자가 전화드려 추천 과정과 시작 방법을 안내해
          드릴게요.
        </p>
        <span>접수번호: {requestId.current}</span>
      </section>
    );
  return (
    <section className="consultation-form" aria-label="전화 상담 신청">
      <h3>나에게 맞는 시작, 전화로 상담해 보세요</h3>
      <p>
        이름과 연락처를 남겨주시면 담당자가 전화드려{" "}
        <strong>{courses[type].action}</strong>이 현재 목표에 맞는지 함께
        살펴드립니다.
      </p>
      {!ready && (
        <p className="consultation-unavailable" role="status">
          전화 상담 접수를 준비하고 있어요. 지금은 카카오톡으로 문의해 주세요.
        </p>
      )}
      <form
        ref={form}
        action={consultationEndpoint || undefined}
        method="POST"
        target="consultation-response"
        onSubmit={(event) => {
          event.preventDefault();
          if (!ready || pending) return;
          const element = event.currentTarget;
          const values = new FormData(element);
          const name = String(values.get("name") || "").trim();
          const phone = String(values.get("phone") || "").replace(/[\s-]/g, "");
          const validation = validLead(
            name,
            phone,
            values.get("consent") === "true",
          );
          if (validation) {
            setError(validation);
            setStatus("error");
            return;
          }
          const fingerprint = JSON.stringify([name, phone, type]);
          if (submittedDetails.current !== fingerprint || !requestId.current) {
            requestId.current = crypto.randomUUID();
            submittedDetails.current = fingerprint;
          }
          (element.elements.namedItem("requestId") as HTMLInputElement).value =
            requestId.current;
          setStatus("pending");
          setError("");
          timeout.current = setTimeout(() => {
            setStatus("error");
            setError(
              "접수 확인이 지연되고 있습니다. 같은 정보로 다시 시도하면 중복 접수를 방지할 수 있습니다.",
            );
          }, 30000);
          // Native POST supports Apps Script redirects without pretending an opaque response is success.
          HTMLFormElement.prototype.submit.call(element);
        }}
      >
        <label htmlFor="lead-name">
          이름 <span>(필수)</span>
        </label>
        <input
          id="lead-name"
          name="name"
          autoComplete="name"
          minLength={2}
          maxLength={40}
          required
          disabled={!ready || pending}
          placeholder="이름을 입력해 주세요"
        />
        <label htmlFor="lead-phone">
          연락처 <span>(필수)</span>
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          required
          disabled={!ready || pending}
          placeholder="010-1234-5678"
        />
        <details className="privacy-details">
          <summary>개인정보 수집·이용 안내</summary>
          <p>
            {consentText ||
              "개인정보 수집 주체와 보유기간 확인 후 안내됩니다. 현재는 정보를 접수하지 않습니다."}
          </p>
        </details>
        <label className="consent-label">
          <input
            type="checkbox"
            name="consent"
            value="true"
            required
            disabled={!ready || pending}
          />{" "}
          <span>전화 상담을 위한 개인정보 수집·이용에 동의합니다. (필수)</span>
        </label>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="requestId" />
        <input type="hidden" name="consentVersion" value={CONSENT_VERSION} />
        <input type="hidden" name="consentText" value={consentText} />
        <div className="lead-honeypot" aria-hidden="true">
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primary" disabled={!ready || pending}>
          {pending ? "접수 확인 중…" : "상담하기"}
          <ArrowRight size={18} />
        </button>
      </form>
      <iframe
        className="response-frame"
        title="상담 접수 처리"
        name="consultation-response"
      />
      {links.consultation && (
        <a
          className="kakao-alternative"
          href={links.consultation}
          target="_blank"
          rel="noopener noreferrer"
        >
          카카오톡으로 문의하기 <ArrowUpRight size={14} />
        </a>
      )}
    </section>
  );
}
