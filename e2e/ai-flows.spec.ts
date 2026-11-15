import { startFakeModelServer, type FakeModelServer } from "./fakeModelServer";
import { createBook, expect, test, useModelServer, writeProse } from "./helpers";

let server: FakeModelServer | undefined;
test.afterEach(async () => {
  await server?.close();
  server = undefined;
});

const PROSE = "Emma låste dörren och gick ner till kajen.";

test.describe("connection states", () => {
  test("a connected server shows no notice and no error", async ({ page }) => {
    server = await startFakeModelServer();
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await expect(page.getByRole("button", { name: "Check again" })).toHaveCount(0);
    await expect(page.locator(".banner")).toHaveCount(0);
  });

  test("a running server with no models gets the calm 'install one' note", async ({ page }) => {
    server = await startFakeModelServer({ models: [] });
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await expect(page.getByText(/no models installed yet/i)).toBeVisible();
  });

  test("nothing listening gets the calm 'no model yet' note, not an error", async ({ page }) => {
    server = await startFakeModelServer();
    const dead = server.url;
    await server.close();
    server = undefined;
    await useModelServer(page, dead);
    await createBook(page, "Nattnycklar");
    await expect(page.getByText(/No local AI model is connected yet/i)).toBeVisible();
  });

  test("a server that answers but sends no CORS headers is reported as blocked", async ({ page }) => {
    server = await startFakeModelServer({ cors: false });
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await expect(page.getByText(/did not accept the browser/i)).toBeVisible();
  });

  test("a server that refuses with 401 is reported as refusing the request", async ({ page }) => {
    server = await startFakeModelServer({ status: 401 });
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await expect(page.getByText(/refused the request/i)).toBeVisible();
  });
});

test.describe("AI writing", () => {
  test("Draft streams the model's reply into the chapter and keeps it after a reload", async ({ page }) => {
    server = await startFakeModelServer({ reply: () => "Emma stood on the quay as the tide turned." });
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await writeProse(page, PROSE);
    await page.getByRole("button", { name: "Draft", exact: true }).click();
    const editor = page.locator('[role="textbox"][contenteditable="true"]');
    await expect(editor).toContainText("Emma stood on the quay as the tide turned.");
    expect(server.chats.length).toBeGreaterThan(0);
    await page.waitForTimeout(1500);
    await page.reload();
    await expect(page.locator('[role="textbox"][contenteditable="true"]')).toContainText("Emma stood on the quay");
  });
});

test.describe("AI review", () => {
  test("Extract facts proposes Story Bible rows, and locking one adds the character", async ({ page }) => {
    server = await startFakeModelServer();
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await writeProse(page, PROSE);
    await page.getByRole("button", { name: "Extract facts", exact: true }).click();
    const review = page.getByRole("dialog");
    await expect(review.getByText("Emma", { exact: false }).first()).toBeVisible();
    await review.getByRole("button", { name: "Lock", exact: true }).click();
    await expect(page.getByRole("tab", { name: /^Characters\s*1$/i })).toBeVisible();
  });

  test("Polish shows a review of both versions; keeping it replaces the chapter, discarding leaves it", async ({ page }) => {
    server = await startFakeModelServer({ reply: () => "Emma stood on the quay as the tide turned." });
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await writeProse(page, PROSE);
    const editor = page.locator('[role="textbox"][contenteditable="true"]');

    await page.getByRole("button", { name: "Polish", exact: true }).click();
    const review = page.getByRole("dialog");
    await expect(review.getByRole("heading", { name: "Review Polish" })).toBeVisible();
    await review.getByRole("button", { name: "Discard" }).click();
    await expect(editor).toContainText(PROSE);

    await page.getByRole("button", { name: "Polish", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Keep this version" }).click();
    await expect(editor).toContainText("Emma stood on the quay as the tide turned.");
    await expect(editor).not.toContainText(PROSE);
  });
});

test("when the server is started after the app, coming back to the window connects without a reload", async ({ page }) => {
  server = await startFakeModelServer();
  const address = server.url;
  await server.close();
  server = undefined;
  await useModelServer(page, address);
  await createBook(page, "Nattnycklar");
  await expect(page.getByText(/No local AI model is connected yet/i)).toBeVisible();

  const port = Number(new URL(address).port);
  server = await startFakeModelServer({ port });
  // The window regaining focus is what triggers the re-check; the app waits a few seconds between probes.
  await page.waitForTimeout(3200);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText(/No local AI model is connected yet/i)).toHaveCount(0);
});
