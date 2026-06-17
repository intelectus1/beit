import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Ingresar' link in the top navigation to open the login page so the email and password fields become available.
        # Ingresar link
        elem = page.get_by_role('link', name='Ingresar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Email field with 'profesor@bait.academy', fill the Password field with 'bait2025', then click the 'Iniciar sesión' button to submit the login form.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("profesor@bait.academy")
        
        # -> Fill the Email field with 'profesor@bait.academy', fill the Password field with 'bait2025', then click the 'Iniciar sesión' button to submit the login form.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2025")
        
        # -> Fill the Email field with 'profesor@bait.academy', fill the Password field with 'bait2025', then click the 'Iniciar sesión' button to submit the login form.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the dashboard is displayed
        # Assert: The browser is on the dashboard page (URL contains 'dashboard').
        await expect(page).to_have_url(re.compile("dashboard"), timeout=15000), "The browser is on the dashboard page (URL contains 'dashboard')."
        # Assert: The dashboard shows the welcome text 'Bienvenido, Profemax'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Bienvenido, Profemax", timeout=15000), "The dashboard shows the welcome text 'Bienvenido, Profemax'."
        
        # --> Verify teacher course management content is visible
        await page.locator("xpath=/html/body/div[1]/div/main/div/div[3]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Nuevo curso' button is visible, confirming teacher course management actions are available.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div[3]/a").nth(0)).to_be_visible(timeout=15000), "The 'Nuevo curso' button is visible, confirming teacher course management actions are available."
        # Assert: A course card contains the 'Ver detalles →' link, indicating course management content is present.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div[4]/a[3]").nth(0)).to_contain_text("Ver detalles \u2192", timeout=15000), "A course card contains the 'Ver detalles \u2192' link, indicating course management content is present."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    