import { expect, test as base, type Page } from "@playwright/test";

/** Every test gets a brand-new browser context, so localStorage and IndexedDB start empty; this only pins the light theme the checks are written against. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => localStorage.setItem("storybook-ai.theme", "light"));
    await use(page);
  }
});
export { expect };

/** Creates a manuscript from the home screen and lands in its chapter editor with the first-time Handbook closed. */
export async function createBook(page: Page, title: string): Promise<void> {
  await page.goto("/");
  const field = page.getByRole("textbox", { name: "Start a new manuscript" });
  await field.fill(title);
  await field.press("Enter");
  // A blank new book opens the Handbook as a modal over the editor.
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("textbox", { name: "Manuscript title" })).toHaveValue(title);
}

/** Types into the chapter editor and waits until the text has had time to be saved. */
export async function writeProse(page: Page, text: string): Promise<void> {
  const editor = page.locator('[role="textbox"][contenteditable="true"]');
  await editor.click();
  await page.keyboard.type(text);
  await expect(editor).toContainText(text.slice(0, 20));
}
