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
        
        # -> Click the 'Cursos' link in the top navigation to open the course catalog page.
        # Cursos link
        elem = page.get_by_text('Inicio', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the course detail page for the course titled 'Introducción a Node.js' (click its 'Ver detalles' link if available, otherwise navigate to the course detail URL) so the course information can be verified.
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify the course detail page is displayed
        # Assert: The URL contains /courses/1 confirming the course detail page is open.
        await expect(page).to_have_url(re.compile("/courses/1"), timeout=15000), "The URL contains /courses/1 confirming the course detail page is open."
        # Assert: Course title 'Introducción a Node.js' is visible on the page.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Introducci\u00f3n a Node.js", timeout=15000), "Course title 'Introducci\u00f3n a Node.js' is visible on the page."
        # Assert: The course description is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Aprende a construir APIs REST con Node.js, Express y PostgreSQL desde cero.", timeout=15000), "The course description is visible on the course detail page."
        await page.locator("xpath=/html/body/div/div/main/div/div/div[2]/div/div/div[4]/span[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Tareas' section is visible on the course detail page.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[2]/div/div/div[4]/span[1]").nth(0)).to_be_visible(timeout=15000), "The 'Tareas' section is visible on the course detail page."
        
        # --> Verify course information is visible
        # Assert: The course title 'Introducción a Node.js' is visible on the page.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Introducci\u00f3n a Node.js", timeout=15000), "The course title 'Introducci\u00f3n a Node.js' is visible on the page."
        # Assert: The course description is visible on the page.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Aprende a construir APIs REST con Node.js, Express y PostgreSQL desde cero.", timeout=15000), "The course description is visible on the page."
        # Assert: The course instructor 'Carlos García' is visible on the page.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Carlos Garc\u00eda", timeout=15000), "The course instructor 'Carlos Garc\u00eda' is visible on the page."
        # Assert: The 'Tareas' section label is visible on the course page.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[2]/div/div/div[4]/span[1]").nth(0)).to_have_text("Tareas", timeout=15000), "The 'Tareas' section label is visible on the course page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    