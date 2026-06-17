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
        
        # -> Click the 'Ingresar' link to open the login page so the SUPER_ADMIN can sign in.
        # Ingresar link
        elem = page.get_by_role('link', name='Ingresar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the email field with 'admin@beit.academy', fill the password field with 'AdminBeit2026!', and click the 'Iniciar sesión' button to sign in as SUPER_ADMIN.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin@beit.academy")
        
        # -> Fill the email field with 'admin@beit.academy', fill the password field with 'AdminBeit2026!', and click the 'Iniciar sesión' button to sign in as SUPER_ADMIN.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("AdminBeit2026!")
        
        # -> Fill the email field with 'admin@beit.academy', fill the password field with 'AdminBeit2026!', and click the 'Iniciar sesión' button to sign in as SUPER_ADMIN.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Aprobar' button for the pending teacher 'Test Teacher' to approve their account.
        # Aprobar button
        elem = page.get_by_role('button', name='Aprobar', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the pending teacher is removed from the review list
        # Assert: The approvals counter shows 'Profesores pendientes de aprobación 0'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Profesores pendientes de aprobaci\u00f3n 0", timeout=15000), "The approvals counter shows 'Profesores pendientes de aprobaci\u00f3n 0'."
        # Assert: The page displays the message 'No hay solicitudes pendientes'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("No hay solicitudes pendientes", timeout=15000), "The page displays the message 'No hay solicitudes pendientes'."
        # Assert: The page shows the subtext 'Todas las cuentas de profesor han sido revisadas'.
        await expect(page.locator("xpath=/html/body/div[1]").nth(0)).to_contain_text("Todas las cuentas de profesor han sido revisadas", timeout=15000), "The page shows the subtext 'Todas las cuentas de profesor han sido revisadas'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    