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
        
        # -> Click the 'Ingresar' link in the top navigation to open the login page.
        # Ingresar link
        elem = page.get_by_role('link', name='Ingresar', exact=True)
        await elem.click(timeout=10000)
        
        # -> input
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@bait.academy")
        
        # -> input
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2025")
        
        # -> click
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the dashboard is displayed
        # Assert: The URL contains /dashboard, confirming the dashboard page is open.
        await expect(page).to_have_url(re.compile("/dashboard"), timeout=15000), "The URL contains /dashboard, confirming the dashboard page is open."
        # Assert: The dashboard displays the welcome header 'Bienvenido, María López'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Bienvenido, Mar\u00eda L\u00f3pez", timeout=15000), "The dashboard displays the welcome header 'Bienvenido, Mar\u00eda L\u00f3pez'."
        # Assert: The 'Explorar cursos' link is visible on the dashboard.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div[3]/a").nth(0)).to_have_text("Explorar cursos", timeout=15000), "The 'Explorar cursos' link is visible on the dashboard."
        
        # --> Verify authenticated course content is visible
        # Assert: Verified the enrolled course title 'Introducción a Node.js' is visible on the dashboard.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Introducci\u00f3n a Node.js", timeout=15000), "Verified the enrolled course title 'Introducci\u00f3n a Node.js' is visible on the dashboard."
        # Assert: Verified the course action link 'Ver detalles →' is visible on the dashboard.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Ver detalles \u2192", timeout=15000), "Verified the course action link 'Ver detalles \u2192' is visible on the dashboard."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    