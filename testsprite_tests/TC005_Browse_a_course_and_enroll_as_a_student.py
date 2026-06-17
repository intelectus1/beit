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
        
        # -> Click the 'Ingresar' link to open the login page so the student can sign in.
        # Ingresar link
        elem = page.get_by_role('link', name='Ingresar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the email field with 'alumno@bait.academy', fill the password field with 'bait2025', and click the 'Iniciar sesión' button to sign in as the student.
        # tu@email.com email field
        elem = page.get_by_placeholder('tu@email.com', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("alumno@bait.academy")
        
        # -> Fill the email field with 'alumno@bait.academy', fill the password field with 'bait2025', and click the 'Iniciar sesión' button to sign in as the student.
        # •••••••• password field
        elem = page.get_by_placeholder('••••••••', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("bait2025")
        
        # -> Fill the email field with 'alumno@bait.academy', fill the password field with 'bait2025', and click the 'Iniciar sesión' button to sign in as the student.
        # Iniciar sesión button
        elem = page.get_by_role('button', name='Iniciar sesión', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Ver detalles →' link on the 'Introducción a Node.js' course card to open the course details page and verify the enrolled state.
        # Explorar cursos link
        elem = page.get_by_role('link', name='Explorar cursos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Introducción a Node.js' course details page by navigating directly to the course details URL (visit the course detail page at '/courses/1') so the enrolled state can be inspected.
        await page.goto("http://localhost:5173/courses/1")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify the course is marked as enrolled
        # Assert: Expected the enroll button to show 'Inscrito' indicating the course is marked as enrolled.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div/div[2]/div/button").nth(0)).to_have_text("Inscrito", timeout=15000), "Expected the enroll button to show 'Inscrito' indicating the course is marked as enrolled."
        # Assert: Expected the page to show 'Alumnos 1' indicating the student is enrolled in the course.
        await expect(page.locator("xpath=/html/body/div").nth(0)).to_contain_text("Alumnos 1", timeout=15000), "Expected the page to show 'Alumnos 1' indicating the student is enrolled in the course."
        
        # --> Test blocked by environment/access constraints during agent run
        # Reason: TEST BLOCKED The test could not be run — enrollment cannot be performed because the course is in draft state and the UI prevents enrollment. Observations: - The course details page displays a 'Borrador' badge and shows 0 alumnos and 'No hay lecciones aún'. - The 'Inscribirme al curso' button is present but disabled (enrollment control is not actionable). Actions performed during this session: -...
        raise AssertionError("Test blocked during agent run: " + "TEST BLOCKED The test could not be run \u2014 enrollment cannot be performed because the course is in draft state and the UI prevents enrollment. Observations: - The course details page displays a 'Borrador' badge and shows 0 alumnos and 'No hay lecciones a\u00fan'. - The 'Inscribirme al curso' button is present but disabled (enrollment control is not actionable). Actions performed during this session: -..." + " — the exported script cannot reproduce a PASS in this environment.")
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    