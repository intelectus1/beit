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
        
        # -> Fill the registration form: enter 'New Student' into the Nombre completo field, 'new.student@example.com' into the Email field, 'ValidPass123!' into the Contraseña field, select the 'Alumno' role, then click the 'Crear cuenta' button to ...
        # Tu nombre completo text field
        elem = page.get_by_placeholder('Tu nombre completo', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("New Student")
        
        # -> Fill the registration form: enter 'New Student' into the Nombre completo field, 'new.student@example.com' into the Email field, 'ValidPass123!' into the Contraseña field, select the 'Alumno' role, then click the 'Crear cuenta' button to ...
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("new.student@example.com")
        
        # -> Fill the registration form: enter 'New Student' into the Nombre completo field, 'new.student@example.com' into the Email field, 'ValidPass123!' into the Contraseña field, select the 'Alumno' role, then click the 'Crear cuenta' button to ...
        # Mínimo 6 caracteres password field
        elem = page.get_by_placeholder('Mínimo 6 caracteres', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ValidPass123!")
        
        # -> Fill the registration form: enter 'New Student' into the Nombre completo field, 'new.student@example.com' into the Email field, 'ValidPass123!' into the Contraseña field, select the 'Alumno' role, then click the 'Crear cuenta' button to ...
        # Alumno button
        elem = page.get_by_role('button', name='Alumno', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the registration form: enter 'New Student' into the Nombre completo field, 'new.student@example.com' into the Email field, 'ValidPass123!' into the Contraseña field, select the 'Alumno' role, then click the 'Crear cuenta' button to ...
        # Crear cuenta button
        elem = page.get_by_role('button', name='Crear cuenta', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the dashboard is displayed
        # Assert: The browser is on the dashboard URL (/dashboard).
        await expect(page).to_have_url(re.compile("/dashboard"), timeout=15000), "The browser is on the dashboard URL (/dashboard)."
        # Assert: The dashboard displays the welcome message 'Bienvenido, New Student'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Bienvenido, New Student", timeout=15000), "The dashboard displays the welcome message 'Bienvenido, New Student'."
        # Assert: The dashboard shows the user's role as 'Alumno'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Alumno", timeout=15000), "The dashboard shows the user's role as 'Alumno'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    