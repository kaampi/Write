import { createBook, expect, test, writeProse } from "./helpers";

const PROSE = "Emma låste dörren. Hon gick ner till kajen.";

test("creates a book and opens it on its first chapter", async ({ page }) => {
  await createBook(page, "Nattnycklar");
  await expect(page.getByRole("textbox", { name: "Chapter title" })).toBeVisible();
  await expect(page.getByText("0 words", { exact: false }).first()).toBeVisible();
});

test("keeps what is written after the page is reloaded", async ({ page }) => {
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  // The editor saves on a short debounce; reload only once the word count has caught up.
  await expect(page.getByText("8 words", { exact: false }).first()).toBeVisible();
  await page.waitForTimeout(1200);
  await page.reload();
  await expect(page.locator('[role="textbox"][contenteditable="true"]')).toContainText(PROSE);
});

test("locks a character into the Story Bible and finds it again after a reload", async ({ page }) => {
  await createBook(page, "Nattnycklar");
  await page.getByRole("button", { name: "New character" }).click();
  const card = page.getByRole("dialog");
  await card.getByRole("textbox", { name: "Name", exact: true }).fill("Emma");
  await card.getByRole("textbox", { name: "The claim, in one line" }).fill("Emma is a smuggler.");
  await card.getByRole("button", { name: "Lock into Story Bible" }).click();
  await expect(card.getByText("Emma is a smuggler.")).toBeVisible();
  const charactersTab = page.getByRole("tab", { name: /^Characters\s*1$/i });
  await expect(charactersTab).toBeVisible();
  await page.waitForTimeout(1200);
  await page.reload();
  await expect(page.getByRole("tab", { name: /^Characters\s*1$/i })).toBeVisible();
});

test("opens Stats on the chapter text and on the whole manuscript", async ({ page }) => {
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.getByRole("button", { name: "Stats", exact: true }).click();
  const stats = page.getByRole("dialog");
  await expect(stats.getByText("8 words · 2 sentences")).toBeVisible();
  await stats.getByRole("tab", { name: "Whole manuscript" }).click();
  await expect(stats.getByText(/Dialogue/i).first()).toBeVisible();
});

test("exports the manuscript as an HTML file that contains the prose", async ({ page }) => {
  // Chromium offers showSaveFilePicker, which opens a native Save As dialog Playwright cannot drive. Without it the
  // app falls back to a plain download link — the path Firefox and Safari use — which `download` can observe.
  await page.addInitScript(() => {
    delete (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker;
  });
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Publish" }).click();
  // The Publish panel is not a role="dialog"; the format picker is the one select that offers HTML.
  await page.getByRole("combobox").filter({ has: page.getByRole("option", { name: "HTML" }) }).selectOption({ label: "HTML" });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Publish", exact: true }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.html$/);
  const stream = await download.createReadStream();
  let html = "";
  for await (const chunk of stream) html += chunk.toString("utf8");
  expect(html).toContain("Nattnycklar");
  expect(html).toContain(PROSE);
});

test("hangs a typed opening quote and marks the real first letter, then keeps it right as typing goes on", async ({ page }) => {
  await createBook(page, "Nattnycklar");
  await writeProse(page, "“");
  const first = page.locator('[role="textbox"][contenteditable="true"] > p').first();
  // Nothing follows the quote yet, so there is no letter to mark.
  await expect(first).toHaveClass(/drop-cap-lead-quote/);
  await expect(first.locator(".drop-cap-letter")).toHaveCount(0);
  await page.keyboard.type("Kom in,” sa hon.");
  await expect(first.locator(".drop-cap-quote")).toHaveText("“");
  await expect(first.locator(".drop-cap-letter")).toHaveText("K");
});
