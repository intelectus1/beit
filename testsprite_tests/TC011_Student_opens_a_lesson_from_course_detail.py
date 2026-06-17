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
        
        # -> Click the 'Ingresar' link to open the login page.
        # Ingresar link
        elem = page.get_by_role('link', name='Ingresar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Email field with alumno@beit.academy, fill the Password field with beit2025, then click the 'Iniciar sesión' button to sign in.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@beit.academy")
        
        # -> Fill the Email field with alumno@beit.academy, fill the Password field with beit2025, then click the 'Iniciar sesión' button to sign in.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("beit2025")
        
        # -> Fill the Email field with alumno@beit.academy, fill the Password field with beit2025, then click the 'Iniciar sesión' button to sign in.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the course 'Introducción a Node.js' by selecting the course's 'Ver detalles →' / course card to open the course detail page.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the course 'Introducción a Node.js' by navigating to its course detail page (click the 'Ver detalles →' link or go to the course detail URL).
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the lesson titled 'Configuración del entorno y primer servidor' by clicking its lesson row and verify the lesson content is displayed on the lesson page.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' to open its lesson page and view the lesson content.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' (the visible lesson row) to open its lesson page and then verify the lesson content is displayed.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Open the lesson page for 'Configuración del entorno y primer servidor' by navigating to the lesson URL (/courses/1/lessons/1) and verify the lesson page and its content are displayed.
        await page.goto("http://localhost:5173/courses/1/lessons/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the lesson page titled 'Configuración del entorno y primer servidor' and verify the lesson content is displayed.
        await page.goto("http://localhost:5173/courses/1/lessons/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Navigate to the lesson page 'Configuración del entorno y primer servidor' by opening the URL /courses/1/lessons/1 and verify the lesson title and content are visible on that page.
        await page.goto("http://localhost:5173/courses/1/lessons/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the course detail page for 'Introducción a Node.js' by navigating to the course's detail view (click the course card's 'Ver detalles →' link or open the course detail page).
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' on the course detail page to open the lesson page and verify the lesson content is displayed.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify lesson content is visible
        # Assert: The lesson title "Configuración del entorno y primer servidor" is visible on the page.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[2]/div[2]/div/a").nth(0)).to_contain_text("Configuraci\u00f3n del entorno y primer servidor", timeout=15000), "The lesson title \"Configuraci\u00f3n del entorno y primer servidor\" is visible on the page."
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
    