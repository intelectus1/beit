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
        
        # -> Click the 'Registro' link in the top navigation to open the registration page.
        # Registro link
        elem = page.get_by_role('link', name='Registro', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the registration form with a new teacher name, new teacher email, a valid password, select 'Profesor' as account type, then click 'Crear cuenta' to submit and reach the authenticated area.
        # Tu nombre completo text field
        elem = page.get_by_placeholder('Tu nombre completo', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Autotest Profesor")
        
        # -> Fill the registration form with a new teacher name, new teacher email, a valid password, select 'Profesor' as account type, then click 'Crear cuenta' to submit and reach the authenticated area.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("autotest.profesor+01@bait.academy")
        
        # -> Fill the registration form with a new teacher name, new teacher email, a valid password, select 'Profesor' as account type, then click 'Crear cuenta' to submit and reach the authenticated area.
        # Mínimo 6 caracteres password field
        elem = page.get_by_placeholder('Mínimo 6 caracteres', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Secret123!")
        
        # -> Fill the registration form with a new teacher name, new teacher email, a valid password, select 'Profesor' as account type, then click 'Crear cuenta' to submit and reach the authenticated area.
        # Profesor button
        elem = page.get_by_role('button', name='Profesor', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the registration form with a new teacher name, new teacher email, a valid password, select 'Profesor' as account type, then click 'Crear cuenta' to submit and reach the authenticated area.
        # Crear cuenta button
        elem = page.get_by_role('button', name='Crear cuenta', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the account is created successfully
        # Assert: The dashboard displays the new user's name 'Autotest Profesor', confirming account creation.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Autotest Profesor", timeout=15000), "The dashboard displays the new user's name 'Autotest Profesor', confirming account creation."
        # Assert: The dashboard shows the role 'Profesor', confirming a teacher account was created.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Profesor", timeout=15000), "The dashboard shows the role 'Profesor', confirming a teacher account was created."
        await page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: A visible 'Salir' button indicates the user is authenticated after registration.
        await expect(page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0)).to_be_visible(timeout=15000), "A visible 'Salir' button indicates the user is authenticated after registration."
        
        # --> Verify the user reaches the authenticated area
        # Assert: The dashboard shows the welcome message 'Bienvenido, Autotest Profesor'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Bienvenido, Autotest Profesor", timeout=15000), "The dashboard shows the welcome message 'Bienvenido, Autotest Profesor'."
        # Assert: The dashboard indicates the user's role is 'Profesor'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Profesor", timeout=15000), "The dashboard indicates the user's role is 'Profesor'."
        await page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: A 'Salir' (logout) button is visible, confirming the user is authenticated.
        await expect(page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0)).to_be_visible(timeout=15000), "A 'Salir' (logout) button is visible, confirming the user is authenticated."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    