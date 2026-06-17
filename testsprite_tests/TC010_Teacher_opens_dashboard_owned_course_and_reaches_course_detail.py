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
        
        # -> Fill the Email field with 'profesor@beit.academy', fill the Contraseña field with 'beit2025', and click the 'Iniciar sesión' button to log in as the teacher.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("profesor@beit.academy")
        
        # -> Fill the Email field with 'profesor@beit.academy', fill the Contraseña field with 'beit2025', and click the 'Iniciar sesión' button to log in as the teacher.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("beit2025")
        
        # -> Fill the Email field with 'profesor@beit.academy', fill the Contraseña field with 'beit2025', and click the 'Iniciar sesión' button to log in as the teacher.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver curso: Introducción a Node.js' link on the dashboard to open the course detail page and verify the course information is displayed.
        # Introducción a Node.js Aprende a construir APIs... link
        elem = page.get_by_role('link', name='Ver curso: Introducción a Node.js', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the course detail page is displayed
        # Assert: The URL contains '/courses/1', indicating the course detail page is open.
        await expect(page).to_have_url(re.compile("/courses/1"), timeout=15000), "The URL contains '/courses/1', indicating the course detail page is open."
        await page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[1]/div[1]/div/button[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Editar' button is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[1]/div[1]/div/button[2]").nth(0)).to_be_visible(timeout=15000), "The 'Editar' button is visible on the course detail page."
        await page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[4]/div[2]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The task 'Crea tu primer endpoint REST' with its 'Máx: 100' label is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[4]/div[2]/a").nth(0)).to_be_visible(timeout=15000), "The task 'Crea tu primer endpoint REST' with its 'M\u00e1x: 100' label is visible on the course detail page."
        
        # --> Verify course information is visible
        # Assert: The course title 'Introducción a Node.js' is visible.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Introducci\u00f3n a Node.js", timeout=15000), "The course title 'Introducci\u00f3n a Node.js' is visible."
        # Assert: The course description is visible.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Aprende a construir APIs REST con Node.js, Express y PostgreSQL desde cero.", timeout=15000), "The course description is visible."
        # Assert: The course instructor 'Carlos García' is visible.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Carlos Garc\u00eda", timeout=15000), "The course instructor 'Carlos Garc\u00eda' is visible."
        await page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[4]/div[2]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The task 'Crea tu primer endpoint REST' is visible in the course information.
        await expect(page.locator("xpath=/html/body/div[1]/div/main/div/div/div[1]/div[4]/div[2]/a").nth(0)).to_be_visible(timeout=15000), "The task 'Crea tu primer endpoint REST' is visible in the course information."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    