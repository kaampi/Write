import { startFakeModelServer, type FakeModelServer } from "./fakeModelServer";
import { createBook, expect, test, useModelServer, writeProse } from "./helpers";

let server: FakeModelServer | undefined;
test.afterEach(async () => {
  await server?.close();
  server = undefined;
});

const KEY = "sk-local-test-key";

test("a server that needs a key is refused until the key is entered in Settings, then connects", async ({ page }) => {
  server = await startFakeModelServer({ requireKey: KEY });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await expect(page.getByText(/refused the request/i)).toBeVisible();

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("API key (optional)", { exact: true }).fill(KEY);
  await expect(page.getByText(/Connected — 1 models found/)).toBeVisible();
  await expect(page.getByText(/refused the request/i)).toHaveCount(0);
});

test("a saved key is sent with every request, including the AI call itself", async ({ page }) => {
  server = await startFakeModelServer({ requireKey: KEY, reply: () => "Emma stood on the quay as the tide turned." });
  await useModelServer(page, server.url);
  await page.addInitScript((key) => localStorage.setItem("storybook-ai.api-key", key), KEY);
  await createBook(page, "Nattnycklar");
  await writeProse(page, "Emma låste dörren.");
  await page.getByRole("button", { name: "Draft", exact: true }).click();
  await expect(page.locator('[role="textbox"][contenteditable="true"]')).toContainText("Emma stood on the quay");
  expect(server.chats.length).toBeGreaterThan(0);
  expect(server.authorizations.length).toBeGreaterThan(1);
  expect(server.authorizations.every((value) => value === `Bearer ${KEY}`)).toBe(true);
});

test("without a key nothing is sent, and the field is masked", async ({ page }) => {
  server = await startFakeModelServer();
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("API key (optional)", { exact: true })).toHaveAttribute("type", "password");
  expect(server.authorizations.every((value) => value === null)).toBe(true);
});
