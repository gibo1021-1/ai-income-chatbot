import test from "node:test";
import assert from "node:assert/strict";
import { diagnose, safeUrl, questions } from "../lib/diagnosis";
test("세 가지 대표 경로가 각각의 유형을 반환한다", () => {
  for (let type = 0; type < 3; type++)
    assert.equal(diagnose(Array(questions.length).fill(type)), type);
});
test("동점이면 목표를 우선하고, 목표 하나로 전체 답변을 무시하지 않는다", () => {
  assert.equal(diagnose([0, 0, 0, 0, 2, 1, 1, 2]), 1);
  assert.equal(diagnose([0, 0, 0, 0, 0, 0, 2, 0]), 0);
});
test("후반 질문의 답변도 결과를 바꾼다", () => {
  assert.equal(diagnose([0, 0, 0, 0, 0, 0, 0, 0]), 0);
  assert.equal(diagnose([0, 0, 0, 0, 1, 1, 1, 1]), 1);
});
test("가능한 6,561개 답변 조합이 유효한 유형을 반환한다", () => {
  for (let n = 0; n < 3 ** questions.length; n++) {
    const answers = Array.from(
      { length: questions.length },
      (_, i) => Math.floor(n / 3 ** i) % 3,
    );
    assert.ok([0, 1, 2].includes(diagnose(answers)));
  }
});
test("불완전하거나 잘못된 답변을 거부한다", () => {
  for (const answers of [
    [],
    [0, 1, 2],
    [0, 0, 0, 0],
    Array(8),
    [...Array(7).fill(0), 3],
    [...Array(7).fill(0), -1],
    [...Array(7).fill(0), 1.5],
    Array(9).fill(0),
  ])
    assert.throws(() => diagnose(answers));
});
test("외부 링크는 유효한 HTTPS URL만 허용한다", () => {
  for (const url of [
    undefined,
    "",
    "javascript:alert(1)",
    "http://example.com",
    "/local",
    "not-a-url",
  ])
    assert.equal(safeUrl(url), null);
  assert.equal(
    safeUrl("https://example.com/apply"),
    "https://example.com/apply",
  );
});
