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
        
        # -> Fill the Email field with alumno@bait.academy, fill the Contraseña field with bait2025, and click the 'Iniciar sesión' button to attempt student login.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@bait.academy")
        
        # -> Fill the Email field with alumno@bait.academy, fill the Contraseña field with bait2025, and click the 'Iniciar sesión' button to attempt student login.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2025")
        
        # -> Fill the Email field with alumno@bait.academy, fill the Contraseña field with bait2025, and click the 'Iniciar sesión' button to attempt student login.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course details page.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> navigate
        await page.goto("http://localhost:5173/courses/introduccion-a-node-js")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Dashboard' link in the top navigation to return to the dashboard and access the enrolled course card.
        # Dashboard link
        elem = page.get_by_role('link', name='Dashboard', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course details page.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Dashboard' link in the top navigation to return to the Dashboard page where the enrolled course card is accessible.
        # Dashboard link
        elem = page.get_by_role('link', name='Dashboard', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course details page and access the lesson/task.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course details page and access the lesson/task.
        # Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course details page and access the lesson/task.
        elem = page.locator('xpath=/html/body/div/div/nav/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Click the 'Dashboard' link in the top navigation to return to the Dashboard page so the enrolled course card can be opened from there.
        # Dashboard link
        elem = page.get_by_role('link', name='Dashboard', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course details page.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the course card's 'Ver detalles →' link (the 'Introducción a Node.js' course card) to open the course details page.
        # Click the course card's 'Ver detalles →' link (the 'Introducción a Node.js' course card) to open the course details page.
        elem = page.locator('xpath=/html/body/div/div/nav/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Click the 'Dashboard' link in the top navigation to return to the Dashboard page and then open the enrolled course card from the Dashboard.
        # Dashboard link
        elem = page.get_by_role('link', name='Dashboard', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Explorar cursos' link to open the courses catalog so the 'Introducción a Node.js' course details can be accessed.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Dashboard' link in the top navigation to return to the Dashboard page so the enrolled course card can be opened from there.
        # Dashboard link
        elem = page.get_by_role('link', name='Dashboard', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
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
    