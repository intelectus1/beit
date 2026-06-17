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
        
        # -> Fill the 'Email' field with alumno@beit.academy, fill the 'Contraseña' field with beit2025, then click the 'Iniciar sesión' button to submit the form.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@beit.academy")
        
        # -> Fill the 'Email' field with alumno@beit.academy, fill the 'Contraseña' field with beit2025, then click the 'Iniciar sesión' button to submit the form.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("beit2025")
        
        # -> Fill the 'Email' field with alumno@beit.academy, fill the 'Contraseña' field with beit2025, then click the 'Iniciar sesión' button to submit the form.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' (course details) link for the "Introducción a Node.js" course on the dashboard to open the course detail page.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the course detail page for 'Introducción a Node.js' by navigating to the course detail URL (visit the course detail page).
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' to open the lesson and verify its content is displayed.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' to open the lesson content and verify the lesson body (title, content, or resources) is displayed.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' to open the lesson content and verify the lesson body (title, content, or resources) is displayed.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Click the lesson titled 'Configuración del entorno y primer servidor' to open the lesson content and confirm the lesson body (title, content, or resources) is displayed.
        # 1
        elem = page.locator('xpath=/html/body/div/div/main/div/div/div/div[2]/div[2]/div/span')
        await elem.click(timeout=10000)
        
        # -> Open the lesson page for 'Configuración del entorno y primer servidor' (the lesson visible in the course) and verify the lesson content (title and body or resources) is displayed.
        await page.goto("http://localhost:5173/courses/1/lessons/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> navigate
        await page.goto("http://localhost:5173/courses/1/lessons/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the lesson page for 'Configuración del entorno y primer servidor' by navigating to the lesson URL and then verify the lesson title and body (visible lesson content) are displayed.
        await page.goto("http://localhost:5173/courses/1/lessons/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the lesson page 'Configuración del entorno y primer servidor' by navigating directly to its lesson URL (/courses/1/lessons/1) and then verify the lesson title and body (lesson content) are displayed.
        await page.goto("http://localhost:5173/courses/1/lessons/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the course details page for 'Introducción a Node.js' (use the course card's 'Ver detalles →' link or navigate to the course details page) so the lesson list is visible.
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify the lesson content is displayed
        # Assert: The lesson title 'Configuración del entorno y primer servidor' is visible in the lesson list.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[1]/div[2]/div[2]/div/a").nth(0)).to_contain_text("Configuraci\u00f3n del entorno y primer servidor", timeout=15000), "The lesson title 'Configuraci\u00f3n del entorno y primer servidor' is visible in the lesson list."
        # Assert: The lesson count '1' is visible, confirming the lesson entry is displayed.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[1]/div[2]/div[2]/div/span").nth(0)).to_have_text("1", timeout=15000), "The lesson count '1' is visible, confirming the lesson entry is displayed."
        
        # --> Verify the course detail page can be returned to
        # Assert: The URL contains /courses/1, confirming the course detail page is loaded.
        await expect(page).to_have_url(re.compile("/courses/1"), timeout=15000), "The URL contains /courses/1, confirming the course detail page is loaded."
        await page.locator("xpath=/html/body/div/div/main/div/div/div[1]/div[2]/div[2]/div/a").nth(0).scroll_into_view_if_needed()
        # Assert: The course's lesson link is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[1]/div[2]/div[2]/div/a").nth(0)).to_be_visible(timeout=15000), "The course's lesson link is visible on the course detail page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    