import { test, expect } from "@playwright/test";
import { courses } from "../lib/diagnosis";
for (let type = 0; type < 3; type++) {
  test(`유형 ${type + 1}: 시작 → 질문 4개 → 추천 과정 → 수정 → 재시작`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "AI 수익화 1분 무료 진단" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "무료 진단 시작하기" }).click();
    await expect(
      page.getByRole("button", { name: "다음 질문" }),
    ).toBeDisabled();
    for (let q = 0; q < 4; q++) {
      await page.locator(".options button").nth(type).click();
      await page
        .getByRole("button", { name: q === 3 ? "진단 결과 보기" : "다음 질문" })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: courses[type].title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".result-box")).toContainText(
      courses[type].price,
    );
    await page.getByRole("button", { name: "답변 수정" }).click();
    await expect(page.locator(".options button").nth(type)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page
      .locator(".options button")
      .nth((type + 1) % 3)
      .click();
    await page.getByRole("button", { name: "다음 질문" }).click();
    await page.getByRole("button", { name: "이전", exact: true }).click();
    await expect(
      page.locator(".options button").nth((type + 1) % 3),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "처음부터 다시 시작" }).click();
    await page.getByRole("button", { name: "무료 진단 시작하기" }).click();
    await expect(
      page.getByRole("button", { name: "다음 질문" }),
    ).toBeDisabled();
    expect(errors).toEqual([]);
  });
}
test("모바일 가로 넘침과 준비 중 링크 상태", async ({ page }) => {
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.resource [aria-disabled="true"]')).toContainText(
    "준비 중",
  );
  await expect(page.locator(".courses .unavailable")).toHaveCount(3);
});
