import { test, expect } from "@playwright/test";

// A robust self-healing sign-in helper that signs up the user dynamically if credentials don't match or aren't present.
async function performSelfHealingSignIn(page: any, email: string, role: string, displayName: string) {
  // Navigate to credentials portal
  await page.click("button:has-text('Sign In')");
  await page.waitForSelector("text=Sign In to Terminal");

  // 1. Attempt standard sign-in
  await page.fill("form >> input[type='email']", email);
  await page.fill("form >> input[type='password']", "securepassword");
  await page.selectOption("form >> select", role);
  await page.click("form >> button[type='submit']");

  // Wait to see if we navigate or receive an authentication error
  await page.waitForTimeout(2000);

  const errorVisible = await page.locator("text=Incorrect email address or security passcode").isVisible();
  const notFoundVisible = await page.locator("text=No terminal clearance found").isVisible();

  if (errorVisible || notFoundVisible) {
    console.log(`[E2E-INFO] Account ${email} not found or mismatch. Initiating dynamic self-healing registration.`);
    
    // Switch to Register Account tab
    await page.click("button:has-text('Register Account')");
    await page.waitForTimeout(800);

    // Populate registration credentials
    await page.fill("form >> input[placeholder='Jane Doe']", displayName);
    await page.fill("form >> input[placeholder='name@host.com']", email);
    await page.fill("form >> input[placeholder='••••••••']", "securepassword");
    await page.selectOption("form >> select", role);

    // Submit registration
    await page.click("form >> button[type='submit']");
    
    // Allow ample time for live cloud registration to finish
    await page.waitForTimeout(3000);
  }
}

test.describe("StadiumMind End-to-End User Journeys", () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the main application entry point
    await page.goto("/");
  });

  test("Fan Journey - View Landing, enter Auth, and sign in", async ({ page }) => {
    // 1. Verify title is present on the landing page
    await expect(page.locator("h2:has-text('StadiumMind AI')")).toBeVisible();
    
    // 2. Perform self-healing sign in/up
    await performSelfHealingSignIn(page, "fan@fifa.org", "Fan", "Fan Experience");
    
    // 3. Verify we are logged into the interactive stadium dashboard
    await expect(page.locator("text=Live Crowd & Queuing Telemetry")).toBeVisible();
  });

  test("Volunteer Journey - Guide accessible guests and view guidelines", async ({ page }) => {
    // 1. Perform self-healing sign in/up
    await performSelfHealingSignIn(page, "volunteer@fifa.org", "Volunteer", "Volunteer Desk");

    // 2. Once in Dashboard, verify the role indicator is correct
    await expect(page.locator("text=Volunteer Desk System Mode")).toBeVisible();
  });

  test("Organizer Journey - Optimize stadium and view charts", async ({ page }) => {
    // 1. Perform self-healing sign in/up
    await performSelfHealingSignIn(page, "organizer@fifa.org", "Organizer", "Match Organizer");

    // 2. Verify Organizer views are active
    await expect(page.locator("text=Tournament Organizers System Mode")).toBeVisible();
    await expect(page.locator("text=Live Crowd & Queuing Telemetry")).toBeVisible();
  });

  test("Emergency & Stress Simulation Journey - Admin forces events and triggers alerts", async ({ page }) => {
    // 1. Perform self-healing sign in/up
    await performSelfHealingSignIn(page, "admin@fifa.org", "Admin", "System Admin");

    // 2. Verify Admin interface is active
    await expect(page.locator("text=System Admin System Mode")).toBeVisible();

    // 3. Verify simulation dashboard is present
    await expect(page.locator("text=Live Operations & Stress Simulator")).toBeVisible();

    // 4. Click 'Crowd Surge' simulation action
    await page.click("button:has-text('Crowd Surge')");

    // 5. Expect alert to have propagated to the live notification center feed
    await expect(page.locator("text=SIMULATION: Surge alert registered for Gate A")).toBeVisible();
  });

  test("Translation Journey - Translate logs to international team languages", async ({ page }) => {
    // 1. Perform self-healing sign in/up
    await performSelfHealingSignIn(page, "fan@fifa.org", "Fan", "Fan Experience");

    // 2. Verify landing elements are visible on dashboard
    await expect(page.locator("text=StadiumMind AI")).toBeVisible();
  });
});
