import { test, expect, type Page } from "@playwright/test";
const configured = process.env.TEST_COLLECTOR_MOCK === "true";
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
  test.skip(
    process.env.TEST_COLLECTOR_DISABLED !== "true",
    "명시적 미설정 모드에서만 확인",
  );
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
    await page
      .getByRole("checkbox", { name: "전화 상담을 위한", exact: false })
      .check();
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
    expect(sent!.get("email")).toBeNull();
    expect(sent!.get("newsletterConsent")).toBeNull();
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

test("뉴스레터 선택 동의 시에만 이메일을 전송한다", async ({ page }) => {
  test.skip(!configured, "저장 연결 모의 테스트용 설정 필요");
  let sent: URLSearchParams | undefined;
  await page.route(
    "https://script.google.com/macros/s/test/exec",
    async (route) => {
      sent = new URLSearchParams(route.request().postData() || "");
      await route.fulfill({
        contentType: "text/html",
        body: `<script>window.top.postMessage(${JSON.stringify({ source: "ai-next-consultation", requestId: sent.get("requestId"), status: "success" })},'http://127.0.0.1:3000');</script>`,
      });
    },
  );
  await result(page);
  await page.getByLabel("이름", { exact: false }).fill("테스트");
  await page.getByLabel("연락처", { exact: false }).fill("010-0000-0000");
  await expect(page.locator("#lead-email")).toBeDisabled();
  await expect(
    page.getByRole("checkbox", { name: "이메일 뉴스레터", exact: false }),
  ).not.toBeChecked();
  await page
    .getByRole("checkbox", { name: "전화 상담을 위한", exact: false })
    .check();
  await page
    .getByRole("checkbox", { name: "이메일 뉴스레터", exact: false })
    .check();
  await page.getByRole("button", { name: "상담하기", exact: true }).click();
  expect(sent).toBeUndefined();
  await page.locator("#lead-email").fill("reader@example.com");
  await page.getByRole("button", { name: "상담하기", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "상담 신청이 접수되었습니다" }),
  ).toBeVisible();
  expect(sent!.get("email")).toBe("reader@example.com");
  expect(sent!.get("newsletterConsent")).toBe("true");
  expect(sent!.get("newsletterText")).toContain("이메일 뉴스레터 발송");
});

test("실제 수신 주소가 폼에 연결되며 전송 전까지 요청하지 않는다", async ({
  page,
}) => {
  test.skip(
    configured || process.env.TEST_COLLECTOR_DISABLED === "true",
    "기본 연결 모드에서만 확인",
  );
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("script.google.com"))
      requests.push(request.method());
  });
  await result(page);
  await expect(page.locator(".consultation-form form")).toHaveAttribute(
    "action",
    "https://script.google.com/macros/s/AKfycbyunldSMFZ1YbMKd8LkkDbXYiFKPupxNCOO3H8MppIThuSNyl9U-nXDgvBAN_G75e1avQ/exec",
  );
  await expect(
    page.getByRole("button", { name: "상담하기", exact: true }),
  ).toBeEnabled();
  await expect(page.locator("#lead-name")).toBeEnabled();
  await expect(
    page.getByRole("checkbox", { name: "이메일 뉴스레터", exact: false }),
  ).not.toBeChecked();
  expect(requests).toEqual([]);
});
