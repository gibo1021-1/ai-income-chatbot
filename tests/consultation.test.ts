import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import {
  collectorUrl,
  validLead,
  trustedCollectorOrigin,
  CONSENT_VERSION,
  buildConsentText,
  buildNewsletterText,
  validNewsletter,
} from "../lib/consultation";

test("상담 입력과 저장 서버 주소를 검증한다", () => {
  assert.equal(validLead("테스트", "010-0000-0000", true), null);
  assert.ok(validLead("=IMPORTDATA()", "01000000000", true));
  assert.ok(validLead("테스트", "123", true));
  assert.ok(validLead("테스트", "01000000000", false));
  assert.equal(
    collectorUrl("https://script.google.com/macros/s/test/exec"),
    "https://script.google.com/macros/s/test/exec",
  );
  assert.equal(
    collectorUrl("https://script.google.com/macros/s/test/dev"),
    null,
  );
  assert.equal(collectorUrl("https://evil.example/exec"), null);
  assert.equal(trustedCollectorOrigin("https://script.google.com"), true);
  assert.equal(
    trustedCollectorOrigin("https://n-test-script.googleusercontent.com"),
    true,
  );
  assert.equal(
    trustedCollectorOrigin("https://evil.googleusercontent.com"),
    false,
  );
});
function server() {
  const rows: unknown[][] = [];
  const cache = new Map<string, string>();
  const config: Record<string, string> = {
    SPREADSHEET_ID: "test-private-sheet",
    PRIVACY_CONTROLLER: "북 브랜딩 랩",
    PRIVACY_RETENTION: "수집일로부터 3년",
  };
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (r: unknown[]) => {
      rows.push([...r]);
    },
    getRange: (r: number, c: number, count?: number) => ({
      getValues: () => rows.slice(r - 1, r - 1 + (count || 1)),
      setNumberFormat() {
        return this;
      },
      setValues(values: unknown[][]) {
        values.forEach((row, i) => {
          rows[r - 1 + i] = [...row];
        });
        return this;
      },
      createTextFinder: (id: string) => ({
        matchEntireCell: () => ({
          findNext: () =>
            rows.slice(1).some((row) => row[c - 1] === id) ? {} : null,
        }),
      }),
    }),
  };
  const book = { getSheetByName: () => sheet };
  const context = vm.createContext({
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => config[key],
      }),
    },
    SpreadsheetApp: { openById: () => book, flush: () => {} },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {},
        hasLock: () => true,
        releaseLock: () => {},
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k: string) => cache.get(k),
        put: (k: string, v: string) => cache.set(k, v),
      }),
    },
    Utilities: { formatDate: () => "2026-11-02 15:00:00" },
    HtmlService: {
      XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
      createHtmlOutput: (html: string) => ({
        html,
        setXFrameOptionsMode() {
          return this;
        },
      }),
    },
  });
  vm.runInContext(
    readFileSync("integrations/google-apps-script/Code.gs", "utf8"),
    context,
  );
  const consentText = context.leadConsent_({
    controller: config.PRIVACY_CONTROLLER,
    retention: config.PRIVACY_RETENTION,
  });
  assert.equal(
    consentText,
    buildConsentText(config.PRIVACY_CONTROLLER, config.PRIVACY_RETENTION),
  );
  assert.equal(
    context.leadNewsletter_({
      controller: config.PRIVACY_CONTROLLER,
      retention: config.PRIVACY_RETENTION,
    }),
    buildNewsletterText(config.PRIVACY_CONTROLLER, config.PRIVACY_RETENTION),
  );
  const payload = {
    name: "테스트",
    phone: "010-0000-0000",
    type: "1",
    consent: "true",
    consentVersion: CONSENT_VERSION,
    consentText,
    requestId: "00000000-0000-4000-8000-000000000001",
  };
  return {
    rows,
    payload,
    post: (p: Record<string, unknown>) =>
      context.doPost({ parameter: p }).html as string,
  };
}
test("서버가 접수와 동의문을 저장하고 같은 접수번호는 중복 저장하지 않는다", () => {
  const s = server();
  assert.match(s.post(s.payload), /"status":"success"/);
  assert.equal(s.rows.length, 2);
  assert.equal(s.rows[1][3], "01000000000");
  assert.equal(s.rows[1][4], "AI 브랜드·수익 시스템 구축형");
  assert.equal(s.rows[1][7], CONSENT_VERSION);
  assert.equal(s.rows[1][8], s.payload.consentText);
  assert.match(String(s.rows[1][8]), /수집·이용 주체: 북 브랜딩 랩/);
  assert.match(String(s.rows[1][8]), /코칭 및 교육을 위한 참고자료 활용/);
  assert.doesNotMatch(String(s.rows[1][8]), /뉴스레터/);
  assert.match(s.post(s.payload), /"status":"success"/);
  assert.equal(s.rows.length, 2);
});
test("미동의·잘못된 입력·변조된 정책은 서버에서 저장하지 않는다", () => {
  for (const patch of [
    { consent: "false" },
    { name: "=HYPERLINK()" },
    { phone: "123" },
    { type: "9" },
    { consentText: "다른 정책" },
    { consentVersion: "old" },
    { website: "spam" },
  ]) {
    const s = server();
    assert.match(s.post({ ...s.payload, ...patch }), /"status":"error"/);
    assert.equal(s.rows.length, 0);
  }
});

test("뉴스레터 동의와 이메일은 선택이며 미동의 이메일은 저장하지 않는다", () => {
  assert.equal(validNewsletter("", false), null);
  assert.ok(validNewsletter("", true));
  assert.ok(validNewsletter("=bad@example.com", true));
  assert.equal(validNewsletter("reader@example.com", true), null);
  const without = server();
  assert.match(
    without.post({ ...without.payload, email: "ignore@example.com" }),
    /"status":"success"/,
  );
  assert.equal(without.rows[1][11], "");
  assert.equal(without.rows[1][12], "미동의");
  const withEmail = server();
  assert.match(
    withEmail.post({
      ...withEmail.payload,
      newsletterConsent: "true",
      email: "reader@example.com",
      newsletterText: buildNewsletterText("북 브랜딩 랩", "수집일로부터 3년"),
    }),
    /"status":"success"/,
  );
  assert.equal(withEmail.rows[1][11], "reader@example.com");
  assert.equal(withEmail.rows[1][12], "동의");
  const invalid = server();
  assert.match(
    invalid.post({
      ...invalid.payload,
      newsletterConsent: "true",
      email: "bad",
    }),
    /"status":"error"/,
  );
  assert.equal(invalid.rows.length, 0);
});
