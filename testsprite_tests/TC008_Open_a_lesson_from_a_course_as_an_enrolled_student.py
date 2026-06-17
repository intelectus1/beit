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
        
        # -> Open the login page by navigating to /login so the student can sign in with the account alumno@bait.academy.
        await page.goto("http://localhost:5173/login")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the Email field with alumno@bait.academy, fill the Contraseña field with bait2025, then click the 'Iniciar sesión' button to submit the form.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@bait.academy")
        
        # -> Fill the Email field with alumno@bait.academy, fill the Contraseña field with bait2025, then click the 'Iniciar sesión' button to submit the form.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2025")
        
        # -> Fill the Email field with alumno@bait.academy, fill the Contraseña field with bait2025, then click the 'Iniciar sesión' button to submit the form.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Cursos' link in the top navigation to open the Courses page so the published course 'Introducción a Node.js' can be selected.
        # Cursos link
        elem = page.get_by_role('link', name='Cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Extract all anchor (<a>) elements on the Courses page, listing each anchor's href, aria-label (if present), and visible text so the 'Ver detalles →' link for 'Introducción a Node.js' can be identified.
        # [internal] extract_content: 
        
        # -> Open the 'Introducción a Node.js' course details page by navigating to the course URL '/courses/3' so the lesson list can be accessed.
        await page.goto("http://localhost:5173/courses/3")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' to open the lesson and verify the lesson content is displayed (look for the lesson title and content area).
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' to open it and verify the lesson content area becomes visible.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the lesson content is displayed
        # Assert: Lesson content includes the title 'Configuración del entorno y primer servidor'.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Configuraci\u00f3n del entorno y primer servidor", timeout=15000), "Lesson content includes the title 'Configuraci\u00f3n del entorno y primer servidor'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    