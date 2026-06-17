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
        await elem.fill("alumno@beit.academy")
        
        # -> input
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("beit2025")
        
        # -> click
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the enrolled course 'Introducción a Node.js' by navigating to its course details page so the graded task can be accessed.
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Crea tu primer endpoint REST' task link to open the task detail page and verify the saved submission, the grade '85/100', and the feedback are displayed.
        # Crea tu primer endpoint REST Máx: 100 link
        elem = page.get_by_role('link', name='Crea tu primer endpoint REST Máx: 100', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the grade and feedback are displayed
        # Assert: The grade 'Calificado: 85 / 100' is visible on the page.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Calificado: 85 / 100", timeout=15000), "The grade 'Calificado: 85 / 100' is visible on the page."
        # Assert: The instructor feedback is visible on the page.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Buen trabajo. Los tres endpoints funcionan correctamente. Considera agregar validaci\u00f3n de entrada en el POST.", timeout=15000), "The instructor feedback is visible on the page."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    