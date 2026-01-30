import os
from playwright.sync_api import sync_playwright

def check_goose_hybrid4():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        path = os.path.abspath('index.html')
        page.goto(f'file://{path}')

        # 1. Start App
        page.click('#btnStartKid')
        page.wait_for_timeout(500)

        # 2. Navigate to Oca (Arcade or Root)
        oca_card = page.locator('div.area-card:has-text("Oca")')
        if oca_card.count() == 0:
             page.click('div.area-card:has-text("ZONA DE JUEGOS")')
             page.wait_for_timeout(500)
             oca_card = page.locator('div.area-card:has-text("Oca")')

        oca_card.click()
        page.wait_for_timeout(1000)

        # 3. Click Hybrid 4 Button (Search by text)
        btn = page.locator('button:has-text("Híbrido 4")')
        if btn.count() == 0:
            print("FAILURE: Hybrid 4 button not found")
            return
        btn.click()
        page.wait_for_timeout(1000)

        # 4. Verify 4 Tokens (Dino, Rex, Hen, Unicorn emojis)
        # Tokens are direct children of boardEl with absolute position
        # Using selector based on style or content
        # Note: Previous failure 0 tokens found. Selector might be wrong.
        # Tokens are appended to boardEl.
        # Let's verify board content.

        tokens = page.locator('.goose-board > div[style*="position:absolute"]')
        count = tokens.count()
        print(f"Tokens found: {count}")

        # Debug: dump board html
        # print(page.locator('.goose-board').inner_html())

        if count == 4:
            print("SUCCESS: 4 Tokens present")
        else:
            print("FAILURE: Incorrect token count")

        # 5. Verify Manual Input
        # Target the specific dice element inside the header
        dice = page.locator('.goose-header div').filter(has_text="🎲").last
        dice.click()
        page.wait_for_timeout(500)

        input_dlg = page.locator('h3:has-text("¿Qué número salió?")')
        if input_dlg.is_visible():
            print("SUCCESS: Manual input visible")
        else:
            print("FAILURE: Manual input not visible")

        browser.close()

if __name__ == '__main__':
    check_goose_hybrid4()
