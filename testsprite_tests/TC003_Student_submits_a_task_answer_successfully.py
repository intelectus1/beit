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
        
        # -> Open the login page by clicking the 'Ingresar' link on the homepage so the login form appears.
        # Ingresar link
        elem = page.get_by_role('link', name='Ingresar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Email field with 'alumno@bait.academy', fill the Password field with 'bait2025', then click the 'Iniciar sesión' button to submit the login form.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@bait.academy")
        
        # -> Fill the Email field with 'alumno@bait.academy', fill the Password field with 'bait2025', then click the 'Iniciar sesión' button to submit the login form.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2025")
        
        # -> Fill the Email field with 'alumno@bait.academy', fill the Password field with 'bait2025', then click the 'Iniciar sesión' button to submit the login form.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Cursos' link in the top navigation to open the Courses page and find the published course.
        # Cursos link
        elem = page.get_by_role('link', name='Cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Introducción a Node.js' course card (the course card area or its 'Ver detalles →' link) to open the course details page.
        # Click the 'Introducción a Node.js' course card (the course card area or its 'Ver detalles →' link) to open the course details page.
        elem = page.locator('xpath=/html/body/div/div/nav/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Navigate directly to the course details page (open the course 'Introducción a Node.js' details page) so the lesson and task list become visible.
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Tarea de prueba: entrega de respuesta' link to open the task page so the response field and submission controls are visible.
        # Tarea de prueba: entrega de respuesta Entrega... link
        elem = page.get_by_role('link', name='Tarea de prueba: entrega de respuesta Entrega: 1/1/2027 Máx: 100', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the response textarea with the text "Mi respuesta" and click the 'Enviar tarea' button to submit the task.
        # Escribe tu respuesta aquí... text area
        elem = page.get_by_placeholder('Escribe tu respuesta aquí...', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Mi respuesta")
        
        # -> Fill the response textarea with the text "Mi respuesta" and click the 'Enviar tarea' button to submit the task.
        # Enviar tarea button
        elem = page.get_by_role('button', name='Enviar tarea', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the submitted answer is shown as saved
        # Assert: The response field contains the saved submission 'Mi respuesta'.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div[2]/form/textarea").nth(0)).to_have_value("Mi respuesta", timeout=15000), "The response field contains the saved submission 'Mi respuesta'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    