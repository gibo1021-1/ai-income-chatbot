import test from "node:test";
import assert from "node:assert/strict";
import { diagnose, safeUrl } from "../lib/diagnosis";
test("세 가지 대표 경로가 각각의 유형을 반환한다", () => {
  for (let type = 0; type < 3; type++)
    assert.equal(diagnose(Array(4).fill(type)), type);
});
test("목표에 가중치를 주고 동점이면 목표를 우선한다", () => {
  assert.equal(diagnose([0, 0, 2, 0]), 2);
  assert.equal(diagnose([2, 2, 1, 2]), 1);
});
test("가능한 81개 답변 조합이 유효한 유형을 반환한다", () => {
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++)
      for (let c = 0; c < 3; c++)
        for (let d = 0; d < 3; d++)
          assert.ok([0, 1, 2].includes(diagnose([a, b, c, d])));
});
test("불완전하거나 잘못된 답변을 거부한다", () => {
  for (const answers of [
    [],
    [0, 1, 2],
    [0, 1, 2, 3],
    [0, 1, 2, -1],
    [0, 1, 2, 1.5],
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
