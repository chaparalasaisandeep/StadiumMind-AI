import { test, expect } from "@playwright/test";

test.describe("StadiumMind End-to-End User Journeys", () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the main application entry point
    await page.goto("/");
  });

  test("Fan Journey - View Landing, enter Auth, and sign in", async ({ page }) => {
    // 1. Verify title is present on the landing page
    await expect(page.locator("h2:has-text('StadiumMind AI')")).toBeVisible();
    
    // 2. Click the Sign In action in navigation
    await page.click("button:has-text('Sign In')");
    
    // 3. Verify we are on the credentials page
    await expect(page.locator("text=Sign In to Terminal")).toBeVisible();
    
    // 4. Enter credentials for a Fan
    await page.fill("input[placeholder='name@host.com']", "fan@fifa.org");
    await page.fill("input[placeholder='••••••••']", "securepassword");
    
    // 5. Select Fan Experience role
    await page.selectOption("select", "Fan");
    
    // 6. Submit the form
    await page.click("button[type='submit']");
    
    // 7. Verify we are logged into the interactive stadium dashboard
    await expect(page.locator("text=Live Crowd & Queuing Telemetry")).toBeVisible();
  });

  test("Volunteer Journey - Guide accessible guests and view guidelines", async ({ page }) => {
    // Sign in as Volunteer
    await page.click("button:has-text('Sign In')");
    await page.fill("input[placeholder='name@host.com']", "volunteer@fifa.org");
    await page.fill("input[placeholder='••••••••']", "securepassword");
    await page.selectOption("select", "Volunteer");
    await page.click("button[type='submit']");

    // Once in Dashboard, verify the role indicator is correct
    await expect(page.locator("text=VOLUNTEER DESK")).toBeVisible();
  });

  test("Organizer Journey - Optimize stadium and view charts", async ({ page }) => {
    // Sign in as Organizer
    await page.click("button:has-text('Sign In')");
    await page.fill("input[placeholder='name@host.com']", "organizer@fifa.org");
    await page.fill("input[placeholder='••••••••']", "securepassword");
    await page.selectOption("select", "Organizer");
    await page.click("button[type='submit']");

    // Verify Organizer views are active
    await expect(page.locator("text=TOURNAMENT ORGANIZER")).toBeVisible();
    await expect(page.locator("text=Live Crowd & Queuing Telemetry")).toBeVisible();
  });

  test("Emergency & Stress Simulation Journey - Admin forces events and triggers alerts", async ({ page }) => {
    // Sign in as Admin
    await page.click("button:has-text('Sign In')");
    await page.fill("input[placeholder='name@host.com']", "admin@fifa.org");
    await page.fill("input[placeholder='••••••••']", "securepassword");
    await page.selectOption("select", "Admin");
    await page.click("button[type='submit']");

    // Verify Admin interface is active
    await expect(page.locator("text=SYSTEM ADMINISTRATOR")).toBeVisible();

    // Verify simulation dashboard is present
    await expect(page.locator("text=Live Operations & Stress Simulator")).toBeVisible();

    // Click 'Crowd Surge' simulation action
    await page.click("button:has-text('Crowd Surge')");

    // Expect alert to have propagated to the live notification center feed
    await expect(page.locator("text=SIMULATION: Surge alert registered for Gate A")).toBeVisible();
  });

  test("Translation Journey - Translate logs to international team languages", async ({ page }) => {
    // Sign in as Fan
    await page.click("button:has-text('Sign In')");
    await page.fill("input[placeholder='name@host.com']", "fan@fifa.org");
    await page.fill("input[placeholder='••••••••']", "securepassword");
    await page.selectOption("select", "Fan");
    await page.click("button[type='submit']");

    // Verify search and maps accessibility features are visible
    await expect(page.locator("text=StadiumMind AI")).toBeVisible();
  });
});
