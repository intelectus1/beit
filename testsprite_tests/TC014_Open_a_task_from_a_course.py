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
        
        # -> Open the login page (the 'Iniciar sesión' / 'Ingresar' page) so the student credentials can be entered.
        await page.goto("http://localhost:5173/login")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
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
        
        # -> click
        # Cursos link
        elem = page.get_by_role('link', name='Cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Introducción a Node.js' course card (the 'Ver detalles →' link area) to open the course detail page and verify the course details are displayed.
        # Click the 'Introducción a Node.js' course card (the 'Ver detalles →' link area) to open the course detail page and verify the course details are displayed.
        elem = page.locator('xpath=/html/body/div/div/nav/div/div/div/div/div/div')
        await elem.click(timeout=10000)
        
        # -> Type 'Introducción a Node.js' into the visible 'Buscar cursos...' search field to trigger filtering or suggestions that reveal the course's 'Ver detalles →' link.
        # Buscar cursos... text field
        elem = page.get_by_placeholder('Buscar cursos...', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Introducci\u00f3n a Node.js")
        
        # -> Extract all anchor text and href values from the visible Courses page to find the 'Ver detalles →' link for the 'Introducción a Node.js' course so the course detail page can be opened.
        # [internal] extract_content: 
        
        # -> Open the course details page for 'Introducción a Node.js' by navigating to its details URL and verify the course detail content is displayed.
        await page.goto("http://localhost:5173/courses/3")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the task titled 'Crea tu primer endpoint REST' in the 'Tareas' section to open its task details view.
        # Crea tu primer endpoint REST Máx: 100 link
        elem = page.get_by_role('link', name='Crea tu primer endpoint REST Máx: 100', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the task details are displayed
        # Assert: The task title 'Crea tu primer endpoint REST' is visible on the page.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Crea tu primer endpoint REST", timeout=15000), "The task title 'Crea tu primer endpoint REST' is visible on the page."
        # Assert: The task description explaining the required endpoints is visible.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Crea un servidor Express con al menos tres endpoints: GET /users, POST /users y DELETE /users/:id. Documenta cada endpoint explicando qu\u00e9 hace y qu\u00e9 devuelve.", timeout=15000), "The task description explaining the required endpoints is visible."
        # Assert: The submission textarea with the placeholder 'Escribe tu respuesta aquí...' is present.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div[2]/form/textarea").nth(0)).to_have_attribute("placeholder", "Escribe tu respuesta aqu\u00ed...", timeout=15000), "The submission textarea with the placeholder 'Escribe tu respuesta aqu\u00ed...' is present."
        # Assert: The 'Enviar tarea' button is visible for submitting the task.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div[2]/form/button").nth(0)).to_have_text("Enviar tarea", timeout=15000), "The 'Enviar tarea' button is visible for submitting the task."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    