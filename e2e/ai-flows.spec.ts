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

test.describe("AI conversations", () => {
  test("the brainstorm chat sends your message and shows the model's answer", async ({ page }) => {
    server = await startFakeModelServer({ reply: () => "What if the tide is the real antagonist?" });
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await page.getByRole("button", { name: "Brainstorm", exact: true }).click();
    await page.getByRole("button", { name: "Talk it through…" }).click();
    const chat = page.getByRole("dialog");
    await chat.getByRole("textbox", { name: "Talk it through" }).fill("How can the quay feel threatening?");
    await chat.getByRole("button", { name: "Send", exact: true }).click();
    await expect(chat.getByText("What if the tide is the real antagonist?")).toBeVisible();
    expect(server.chats.length).toBe(1);
    expect(JSON.stringify(server.chats[0]!.messages)).toContain("How can the quay feel threatening?");
  });

  test("interviewing a character answers in character, and the exchange can be turned into facts", async ({ page }) => {
    server = await startFakeModelServer({
      reply: (body) =>
        /Return JSON only, shaped as/.test(JSON.stringify(body.messages))
          ? JSON.stringify({ facts: [{ entity_label: "Emma", predicate: "core.identity", value: "Emma smuggles at night." }] })
          : "Emma stood on the quay as the tide turned."
    });
    await useModelServer(page, server.url);
    await createBook(page, "Nattnycklar");
    await page.getByRole("button", { name: "New character" }).click();
    const card = page.getByRole("dialog");
    await card.getByRole("textbox", { name: "Name", exact: true }).fill("Emma");
    await card.getByRole("textbox", { name: "The claim, in one line" }).fill("Emma is a smuggler.");
    await card.getByRole("button", { name: "Lock into Story Bible" }).click();
    await card.getByRole("button", { name: "Interview" }).click();
    const interview = page.getByRole("dialog");
    await interview.getByPlaceholder(/Ask Emma something/i).fill("What do you do at night?");
    await interview.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(interview.getByText("Emma stood on the quay as the tide turned.")).toBeVisible();
    expect(JSON.stringify(server.chats[0]!.messages)).toContain("What do you do at night?");

    await interview.getByRole("button", { name: "Extract facts" }).click();
    await expect(page.getByText("Review facts", { exact: false }).first()).toBeVisible();
  });
});

test("choosing a development method sticks across a reload", async ({ page }) => {
  await createBook(page, "Nattnycklar");
  await page.getByRole("button", { name: "Development method", exact: true }).click();
  const choose = page.getByRole("button", { name: "Use this method" });
  await expect(choose).toHaveCount(4);
  await choose.first().click();
  // The list of methods is replaced by the chosen method's own steps.
  await expect(choose).toHaveCount(0);
  await page.waitForTimeout(1200);
  await page.reload();
  await page.getByRole("button", { name: "Development method", exact: true }).click();
  await expect(page.getByRole("button", { name: "Use this method" })).toHaveCount(0);
});

test("History keeps the text from before a Draft, and restoring it brings it back", async ({ page }) => {
  server = await startFakeModelServer({ reply: () => "Emma stood on the quay as the tide turned." });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Draft", exact: true }).click();
  const editor = page.locator('[role="textbox"][contenteditable="true"]');
  await expect(editor).toContainText("Emma stood on the quay as the tide turned.");
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "History", exact: true }).click();
  const history = page.getByRole("dialog");
  await expect(history.getByText(/^Draft ·/i).first()).toBeVisible();
  await history.getByRole("button", { name: "Restore" }).first().click();
  await expect(editor).toContainText(PROSE);
  await expect(editor).not.toContainText("Emma stood on the quay");
});

test("Analyze shows the model's observations about the chapter", async ({ page }) => {
  server = await startFakeModelServer({
    reply: () =>
      JSON.stringify({ items: [{ category: "show_vs_tell", quote: "Emma felt sad", observation: "Names the feeling instead of showing it." }] })
  });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await writeProse(page, "Emma felt sad when the tide went out.");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  const notes = page.getByRole("dialog");
  await expect(notes.getByRole("heading", { name: "Chapter notes" })).toBeVisible();
  await expect(notes.getByText("Show vs tell")).toBeVisible();
  await expect(notes.getByText("Emma felt sad")).toBeVisible();
});

test("Ask about chapter answers a question about the text", async ({ page }) => {
  server = await startFakeModelServer({ reply: () => "She locked it before leaving." });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.getByRole("button", { name: "Ask about chapter…" }).click();
  await page.getByPlaceholder(/Does this build toward/).fill("Did she lock the door?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText("She locked it before leaving.")).toBeVisible();
  expect(JSON.stringify(server.chats[0]!.messages)).toContain("Did she lock the door?");
});

test("Recast rewrites the chapter from the model's new version", async ({ page }) => {
  server = await startFakeModelServer({ reply: () => "I locked the door and walked down to the quay." });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Chapter settings for Chapter 1" }).click();
  await page.getByRole("button", { name: "Recast prose", exact: true }).click();
  const editor = page.locator('[role="textbox"][contenteditable="true"]');
  await expect(editor).toContainText("I locked the door and walked down to the quay.");
  expect(JSON.stringify(server.chats[0]!.messages)).toContain(PROSE);
});

test("Critics runs the chosen readers and lists their notes", async ({ page }) => {
  server = await startFakeModelServer({
    reply: () => JSON.stringify({ items: [{ quote: "gick ner till kajen", observation: "The move to the quay is abrupt." }] })
  });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.getByRole("button", { name: "Critics", exact: true }).click();
  const picker = page.getByRole("dialog");
  await picker.getByRole("checkbox").first().check();
  await picker.getByRole("button", { name: "Run critics" }).click();
  // Like Analyze, the notes list the quoted line; the observation opens on click.
  await expect(page.getByRole("dialog").getByText("gick ner till kajen")).toBeVisible();
  expect(server.chats.length).toBe(1);
});

test("Summarize proposes a one-line chapter summary", async ({ page }) => {
  server = await startFakeModelServer({ reply: () => "Emma locks up and heads for the quay." });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Show brief for Chapter 1" }).click();
  await page.getByRole("button", { name: "Summarize", exact: true }).click();
  await expect(page.getByText("Emma locks up and heads for the quay.")).toBeVisible();
});

test("selecting a sentence and choosing Extend adds the model's continuation after it", async ({ page }) => {
  server = await startFakeModelServer({ reply: () => " The tide had already begun to turn." });
  await useModelServer(page, server.url);
  await createBook(page, "Nattnycklar");
  await writeProse(page, PROSE);
  await page.waitForTimeout(1200);
  const paragraph = page.locator('[role="textbox"][contenteditable="true"] > p').first();
  await paragraph.click({ clickCount: 3 });
  // Rewriting a selection lives on the right-click menu.
  await paragraph.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Extend", exact: true }).click();
  await expect(page.locator('[role="textbox"][contenteditable="true"]')).toContainText("The tide had already begun to turn.");
});
