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
        
        # -> Fill the 'Nombre completo' field with a new student name, the 'Email' field with a unique student email, set a valid password, select the 'Alumno' account type, and click the 'Crear cuenta' button to submit the registration form.
        # Tu nombre completo text field
        elem = page.get_by_placeholder('Tu nombre completo', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Alumno de Prueba 2026")
        
        # -> Fill the 'Nombre completo' field with a new student name, the 'Email' field with a unique student email, set a valid password, select the 'Alumno' account type, and click the 'Crear cuenta' button to submit the registration form.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno.prueba+20260615@example.com")
        
        # -> Fill the 'Nombre completo' field with a new student name, the 'Email' field with a unique student email, set a valid password, select the 'Alumno' account type, and click the 'Crear cuenta' button to submit the registration form.
        # Mínimo 6 caracteres password field
        elem = page.get_by_placeholder('Mínimo 6 caracteres', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2026!")
        
        # -> Fill the 'Nombre completo' field with a new student name, the 'Email' field with a unique student email, set a valid password, select the 'Alumno' account type, and click the 'Crear cuenta' button to submit the registration form.
        # Alumno button
        elem = page.get_by_role('button', name='Alumno', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Nombre completo' field with a new student name, the 'Email' field with a unique student email, set a valid password, select the 'Alumno' account type, and click the 'Crear cuenta' button to submit the registration form.
        # Crear cuenta button
        elem = page.get_by_role('button', name='Crear cuenta', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the account is created successfully
        # Assert: User is on the dashboard after registration.
        await expect(page).to_have_url(re.compile("dashboard"), timeout=15000), "User is on the dashboard after registration."
        await page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: A visible 'Salir' button is present, indicating the user is logged in.
        await expect(page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0)).to_be_visible(timeout=15000), "A visible 'Salir' button is present, indicating the user is logged in."
        
        # --> Verify the user reaches the authenticated area
        # Assert: The page displays the logged-in user's name 'Alumno de Prueba 2026'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Alumno de Prueba 2026", timeout=15000), "The page displays the logged-in user's name 'Alumno de Prueba 2026'."
        await page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Salir' (logout) button is visible, indicating the user is authenticated.
        await expect(page.locator("xpath=/html/body/div[1]/div/nav/div/div/div/div/button").nth(0)).to_be_visible(timeout=15000), "The 'Salir' (logout) button is visible, indicating the user is authenticated."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    