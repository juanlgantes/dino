import os
from playwright.sync_api import sync_playwright

def check_svg_rendering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        path = os.path.abspath('index.html')
        page.goto(f'file://{path}')

        # 1. Start App
        page.click('#btnStartKid')
        page.wait_for_timeout(500)

        # 2. Navigate to Secuencias
        # Assuming in Root
        seq_card = page.locator('div.area-card:has-text("Secuencias")')
        if seq_card.count() == 0:
             page.click('div.area-card:has-text("ZONA DE JUEGOS")')
             page.wait_for_timeout(500)
             seq_card = page.locator('div.area-card:has-text("Secuencias")')

        seq_card.click()
        page.wait_for_timeout(1000)

        # 3. Enter Level Figures (Shapes)
        page.click('button:has-text("Figuras 🔺")')
        page.wait_for_timeout(1000)

        # 4. Check for SVG tags
        # The sequence items should contain <svg> if successful
        svgs = page.locator('#gameArea svg')
        count = svgs.count()
        print(f"SVGs found: {count}")

        if count >= 3:
            print("SUCCESS: SVGs rendered")
        else:
            print("FAILURE: SVGs not found")
            page.screenshot(path='verification/svg_fail.png')

        page.screenshot(path='verification/svg_success.png')
        browser.close()

if __name__ == '__main__':
    check_svg_rendering()
