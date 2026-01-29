import os
from playwright.sync_api import sync_playwright

def check_hybrid4():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        path = os.path.abspath('index.html')
        page.goto(f'file://{path}')

        # Navigate
        page.click('#btnStartKid')
        page.wait_for_timeout(500)

        if page.locator('div.area-card:has-text("ZONA DE JUEGOS")').count() > 0:
             page.click('div.area-card:has-text("ZONA DE JUEGOS")')
             page.wait_for_timeout(500)

        page.click('div.area-card:has-text("Parchís")')
        page.wait_for_timeout(1000)

        # Click "Híbrido 4"
        btn = page.locator('button:has-text("Híbrido 4")')
        if btn.count() == 0:
            print("FAILURE: Hybrid 4 button not found")
            return

        btn.click()
        page.wait_for_timeout(1000)

        # Verify 16 pieces
        pieces = page.locator('.parchis-piece').count()
        print(f"Pieces count: {pieces}")
        if pieces != 16:
             print("FAILURE: Expected 16 pieces")
        else:
             print("SUCCESS: 16 pieces found")

        # Click Dice
        page.click('.parchis-dice')
        page.wait_for_timeout(500)

        # Find input dialog - targeting the specific popup container
        # It's a div with absolute positioning and white background
        input_dlg = page.locator('div[style*="position: absolute"][style*="z-index: 100"]')

        if input_dlg.count() > 0 and input_dlg.first.is_visible():
             # Check if it contains the text
             if "¿Qué número salió?" in input_dlg.first.inner_text():
                 print("SUCCESS: Manual input visible")
             else:
                 print("FAILURE: Input dialog content mismatch")
        else:
            print("FAILURE: Manual input not visible")

        browser.close()

if __name__ == '__main__':
    check_hybrid4()
