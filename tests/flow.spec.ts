import { test, expect } from "@playwright/test";
import { freeResources } from "../lib/resources";
import { courses, questions } from "../lib/diagnosis";
for (let type = 0; type < 3; type++) {
  test(`유형 ${type + 1}: 시작 → 질문 8개 → 추천 과정 → 수정 → 재시작`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./");
    await expect(
      page.getByRole("heading", { name: "AI 수익화 무료 진단" }),
    ).toBeVisible();
    for (const c of courses)
      await expect(page.getByText(c.price, { exact: false })).toHaveCount(0);
    await page.getByRole("button", { name: "무료 진단 시작하기" }).click();
    await expect(
      page.getByRole("button", { name: "다음 질문" }),
    ).toBeDisabled();
    for (let q = 0; q < questions.length; q++) {
      for (const c of courses)
        await expect(page.getByText(c.price, { exact: false })).toHaveCount(0);
      await expect(page.locator(".progress")).toHaveAttribute(
        "aria-label",
        `질문 ${q + 1}/${questions.length}`,
      );
      await page.locator(".options button").nth(type).click();
      await page
        .getByRole("button", {
          name: q === questions.length - 1 ? "진단 결과 보기" : "다음 질문",
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: courses[type].title, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("임시 가격", { exact: false })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "상담하기", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".need-summary")).toContainText(
      questions[2].options[type],
    );
    await expect(page.locator(".result-box")).toContainText(
      courses[type].price,
    );
    for (let other = 0; other < courses.length; other++) {
      if (other !== type)
        await expect(
          page.getByText(courses[other].price, { exact: false }),
        ).toHaveCount(0);
    }
    await expect(
      page
        .getByRole("list", { name: "추천 과정 학습 내용" })
        .getByRole("listitem"),
    ).toHaveCount(3);
    await page.getByRole("button", { name: "답변 수정" }).click();
    for (const c of courses)
      await expect(page.getByText(c.price, { exact: false })).toHaveCount(0);
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
    for (const c of courses)
      await expect(page.getByText(c.price, { exact: false })).toHaveCount(0);
    await page.getByRole("button", { name: "무료 진단 시작하기" }).click();
    await expect(
      page.getByRole("button", { name: "다음 질문" }),
    ).toBeDisabled();
    expect(errors).toEqual([]);
  });
}
test("무료 자료 목록과 모바일 가로 넘침", async ({ page }) => {
  await page.goto("./");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const ebook = page.getByRole("link", { name: /AI 활용법 완전초보 전자책/ });
  await expect(ebook).not.toBeVisible();
  await page.locator(".resource-details summary").click();
  await expect(ebook).toBeVisible();
  await expect(page.locator(".resource-links > li")).toHaveCount(7);
  for (const resource of freeResources) {
    const link = page.getByRole("link", { name: resource.title, exact: false });
    await expect(link).toHaveAttribute("href", resource.url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(ebook).toHaveAttribute("href", "https://url.kr/he1eak");
  await expect(ebook).toHaveAttribute("target", "_blank");
  await expect(ebook).toHaveAttribute("rel", "noopener noreferrer");
  await page.locator(".resource-details summary").click();
  await expect(ebook).not.toBeVisible();
  await expect(page.locator(".result-box")).toHaveCount(0);
});

test("상담 신청이 카카오톡 채널에 새 창으로 연결된다", async ({ page }) => {
  await page.goto("./");
  const link = page.getByRole("link", { name: "상담 신청" });
  await expect(link).toHaveAttribute(
    "href",
    "https://pf.kakao.com/_xgrjxaX/chat",
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
});
