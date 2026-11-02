import { test, expect, type Page } from "@playwright/test";
const configured = Boolean(
  process.env.NEXT_PUBLIC_CONSULTATION_ENDPOINT &&
  process.env.NEXT_PUBLIC_PRIVACY_CONTROLLER &&
  process.env.NEXT_PUBLIC_PRIVACY_RETENTION,
);
async function result(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: "무료 진단 시작하기" }).click();
  for (let q = 0; q < 8; q++) {
    await page.locator(".options button").first().click();
    await page
      .getByRole("button", { name: q === 7 ? "진단 결과 보기" : "다음 질문" })
      .click();
  }
}
test("저장 연결이 없으면 개인정보를 전송할 수 없다", async ({ page }) => {
  test.skip(configured, "미설정 모드 검증");
  await result(page);
  await expect(
    page.getByRole("button", { name: "상담하기", exact: true }),
  ).toBeDisabled();
  await expect(page.getByLabel("이름", { exact: false })).toBeDisabled();
});
for (const outcome of ["success", "error", "silence"])
  test(`상담 전송 서버 ${outcome} 확인을 반영한다`, async ({ page }) => {
    test.skip(!configured, "저장 연결 모의 테스트용 설정 필요");
    let sent: URLSearchParams | undefined;
    await page.route(
      "https://script.google.com/macros/s/test/exec",
      async (route) => {
        expect(route.request().method()).toBe("POST");
        sent = new URLSearchParams(route.request().postData() || "");
        const data = {
          source: "ai-next-consultation",
          requestId: sent.get("requestId"),
          status: outcome,
        };
        await route.fulfill({
          contentType: "text/html",
          body:
            outcome === "silence"
              ? "<html></html>"
              : `<script>window.top.postMessage(${JSON.stringify(data)},'http://127.0.0.1:3000');</script>`,
        });
      },
    );
    await result(page);
    if (outcome === "silence") await page.clock.install();
    await page.getByLabel("이름", { exact: false }).fill("테스트");
    await page.getByLabel("연락처", { exact: false }).fill("010-0000-0000");
    await page.getByRole("button", { name: "상담하기", exact: true }).click();
    expect(sent).toBeUndefined(); // Unchecked required consent blocks the POST.
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "상담하기", exact: true }).click();
    if (outcome === "silence") {
      await expect.poll(() => Boolean(sent)).toBe(true);
      await page.evaluate(
        (id) =>
          window.dispatchEvent(
            new MessageEvent("message", {
              origin: "https://evil.example",
              data: {
                source: "ai-next-consultation",
                requestId: id,
                status: "success",
              },
            }),
          ),
        sent!.get("requestId"),
      );
      await expect(
        page.getByRole("heading", { name: "상담 신청이 접수되었습니다" }),
      ).toHaveCount(0);
      await page.clock.fastForward(31000);
      await expect(
        page.locator(".consultation-form").getByRole("alert"),
      ).toContainText("접수 확인이 지연");
    } else if (outcome === "success")
      await expect(
        page.getByRole("heading", { name: "상담 신청이 접수되었습니다" }),
      ).toBeVisible();
    else {
      await expect(
        page.locator(".consultation-form").getByRole("alert"),
      ).toContainText("접수를 완료하지 못했습니다");
      await expect(page.getByLabel("이름", { exact: false })).toHaveValue(
        "테스트",
      );
    }
    expect(sent!.get("type")).toBe("0");
    expect(sent!.get("consent")).toBe("true");
    expect(sent!.get("name")).toBe("테스트");
    await page.evaluate(() =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://evil.example",
          data: {
            source: "ai-next-consultation",
            requestId: "fake",
            status: "success",
          },
        }),
      ),
    );
    if (outcome === "error")
      await expect(
        page.getByRole("heading", { name: "상담 신청이 접수되었습니다" }),
      ).toHaveCount(0);
  });
