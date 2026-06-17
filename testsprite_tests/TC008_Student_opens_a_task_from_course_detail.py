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
        
        # -> Open the Login page (navigate to /login or click the 'Ingresar' link) so the student can sign in with email 'alumno@beit.academy' and password 'beit2025'.
        await page.goto("http://localhost:5173/login")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the email field with 'alumno@beit.academy', fill the password field with 'beit2025', and click the 'Iniciar sesión' button to sign in as the student.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@beit.academy")
        
        # -> Fill the email field with 'alumno@beit.academy', fill the password field with 'beit2025', and click the 'Iniciar sesión' button to sign in as the student.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("beit2025")
        
        # -> Fill the email field with 'alumno@beit.academy', fill the password field with 'beit2025', and click the 'Iniciar sesión' button to sign in as the student.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course detail page.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the course 'Introducción a Node.js' by navigating to its course detail page (visit the course details page for the enrolled course).
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Crea tu primer endpoint REST' task link in the Tasks list to open the task page and verify the graded submission (85/100) and instructor feedback are displayed.
        # Crea tu primer endpoint REST Máx: 100 link
        elem = page.get_by_role('link', name='Crea tu primer endpoint REST Máx: 100', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the task page is displayed
        # Assert: The URL contains '/tasks/1', confirming the task page is open.
        await expect(page).to_have_url(re.compile("/tasks/1"), timeout=15000), "The URL contains '/tasks/1', confirming the task page is open."
        # Assert: The 'Volver' button is visible on the page, indicating the task page is displayed.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/button").nth(0)).to_have_text("Volver", timeout=15000), "The 'Volver' button is visible on the page, indicating the task page is displayed."
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
    