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
        
        # -> Open the site's Login page by navigating to the 'Iniciar sesión' (Login) route (/login) so the SUPER_ADMIN credentials can be entered.
        await page.goto("http://localhost:5173/login")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the Email field with admin@beit.academy, fill the Password field with AdminBeit2026!, then click the 'Iniciar sesión' button to sign in as SUPER_ADMIN.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin@beit.academy")
        
        # -> Fill the Email field with admin@beit.academy, fill the Password field with AdminBeit2026!, then click the 'Iniciar sesión' button to sign in as SUPER_ADMIN.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("AdminBeit2026!")
        
        # -> Fill the Email field with admin@beit.academy, fill the Password field with AdminBeit2026!, then click the 'Iniciar sesión' button to sign in as SUPER_ADMIN.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Rechazar' (Reject) button for the pending teacher entry labeled 'Test Pending Teacher' to attempt rejection through the UI.
        # Rechazar button
        elem = page.get_by_text('Test Pending Teacher', exact=True).locator("xpath=ancestor-or-self::*[.//button][1]").get_by_role('button', name='Rechazar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Rechazar' (Reject) button for the 'Test Teacher' entry in the pending requests list to attempt the rejection action and then verify the UI updates.
        # Rechazar button
        elem = page.get_by_role('button', name='Rechazar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Actualizar' (Refresh) button on the Super Admin page to reload the pending teacher list and verify the 'No hay solicitudes pendientes' message and the count '0' persist.
        # Actualizar button
        elem = page.get_by_role('button', name='Actualizar', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the pending teacher is removed from the review list
        # Assert: The Super Admin approvals panel shows the pending teachers count as 0.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Profesores pendientes de aprobaci\u00f3n 0", timeout=15000), "The Super Admin approvals panel shows the pending teachers count as 0."
        # Assert: The page displays 'No hay solicitudes pendientes', confirming there are no pending teacher requests.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("No hay solicitudes pendientes", timeout=15000), "The page displays 'No hay solicitudes pendientes', confirming there are no pending teacher requests."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    