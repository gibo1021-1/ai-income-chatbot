import { test, expect } from "@playwright/test";

test("큰 글자·버튼과 320px 화면 및 200% 글자 확대를 지원한다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("./");
  const noOverflow = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  await noOverflow();
  expect(
    await page
      .locator(".hero-description")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(18);
  expect(
    await page
      .locator(".card-foot")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(16);
  expect(
    (await page
      .getByRole("button", { name: "무료 진단 시작하기" })
      .boundingBox())!.height,
  ).toBeGreaterThanOrEqual(48);
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await noOverflow();
  await page.getByRole("button", { name: "무료 진단 시작하기" }).click();
  await noOverflow();
  expect(
    await page
      .locator(".options button")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(36);
  for (let q = 0; q < 8; q++) {
    await page.locator(".options button").first().click();
    await page
      .getByRole("button", { name: q === 7 ? "진단 결과 보기" : "다음 질문" })
      .click();
  }
  await noOverflow();
  await page.getByText("개인정보 수집·이용 안내", { exact: true }).click();
  await expect(page.locator(".privacy-details").first()).toContainText(
    "수집일로부터 3년",
  );
  await noOverflow();
  expect(
    await page
      .getByRole("checkbox", { name: "전화 상담을 위한", exact: false })
      .evaluate((el) => el.getBoundingClientRect().width),
  ).toBeGreaterThanOrEqual(24);
});
