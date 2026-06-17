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
        
        # -> Click the 'Ingresar' link to open the login page so the student can sign in.
        # Ingresar link
        elem = page.get_by_role('link', name='Ingresar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Email field with 'alumno@beit.academy', fill the Password field with 'beit2025', then click the 'Iniciar sesión' button to submit the form.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@beit.academy")
        
        # -> Fill the Email field with 'alumno@beit.academy', fill the Password field with 'beit2025', then click the 'Iniciar sesión' button to submit the form.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("beit2025")
        
        # -> Fill the Email field with 'alumno@beit.academy', fill the Password field with 'beit2025', then click the 'Iniciar sesión' button to submit the form.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course detail page and verify course information is displayed (title and description).
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Introducción a Node.js' course detail page by navigating to the course detail URL or clicking the 'Ver detalles →' link on the course card.
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify the course detail page is displayed
        # Assert: The course title 'Introducción a Node.js' is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Introducci\u00f3n a Node.js", timeout=15000), "The course title 'Introducci\u00f3n a Node.js' is visible on the course detail page."
        # Assert: The course description is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Aprende a construir APIs REST con Node.js, Express y PostgreSQL desde cero.", timeout=15000), "The course description is visible on the course detail page."
        
        # --> Verify course information is visible
        # Assert: The course task 'Crea tu primer endpoint REST' is visible on the course page.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[1]/div[3]/div[2]/a").nth(0)).to_contain_text("Crea tu primer endpoint REST", timeout=15000), "The course task 'Crea tu primer endpoint REST' is visible on the course page."
        # Assert: The 'Tareas' section header is visible on the course page.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[2]/div/div[1]/div[4]/span[1]").nth(0)).to_have_text("Tareas", timeout=15000), "The 'Tareas' section header is visible on the course page."
        # Assert: The lessons count ('1') is visible on the course page.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[1]/div[2]/div[2]/div/span").nth(0)).to_have_text("1", timeout=15000), "The lessons count ('1') is visible on the course page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    