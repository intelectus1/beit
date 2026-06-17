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
        
        # -> Fill the email field with 'profesor@bait.academy', fill the password field with 'bait2025', then click the 'Iniciar sesión' button to sign in.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("profesor@bait.academy")
        
        # -> Fill the email field with 'profesor@bait.academy', fill the password field with 'bait2025', then click the 'Iniciar sesión' button to sign in.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2025")
        
        # -> Fill the email field with 'profesor@bait.academy', fill the password field with 'bait2025', then click the 'Iniciar sesión' button to sign in.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Nuevo curso' button on the dashboard to open the course creation form.
        # Nuevo curso link
        elem = page.get_by_role('link', name='Nuevo curso', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Título del curso' and 'Descripción' fields and click the 'Crear curso' button to submit the new course.
        # Ej: Introducción a Python text field
        elem = page.get_by_placeholder('Ej: Introducción a Python', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Curso de prueba autom\u00e1tico 2026-06-15 12:00:00")
        
        # -> Fill the 'Título del curso' and 'Descripción' fields and click the 'Crear curso' button to submit the new course.
        # Describe de qué trata el curso... text area
        elem = page.get_by_placeholder('Describe de qué trata el curso...', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Descripci\u00f3n de prueba creada por el test autom\u00e1tico.")
        
        # -> Fill the 'Título del curso' and 'Descripción' fields and click the 'Crear curso' button to submit the new course.
        # Crear curso button
        elem = page.get_by_role('button', name='Crear curso', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the newly created course detail page is displayed
        # Assert: The URL contains '/courses/', indicating the course detail page is open.
        await expect(page).to_have_url(re.compile("/courses/"), timeout=15000), "The URL contains '/courses/', indicating the course detail page is open."
        await page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[1]/div[1]/div/a").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Editar' link is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[1]/div[1]/div/a").nth(0)).to_be_visible(timeout=15000), "The 'Editar' link is visible on the course detail page."
        await page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[1]/div[1]/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Publicar' button is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[1]/div[1]/div/button").nth(0)).to_be_visible(timeout=15000), "The 'Publicar' button is visible on the course detail page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    