import os
from playwright.sync_api import sync_playwright

def check_sequence_game():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        path = os.path.abspath('index.html')
        page.goto(f'file://{path}')

        # 1. Start App
        page.click('#btnStartKid')
        page.wait_for_timeout(500)

        # 2. Navigate to "Secuencias" in Games Zone
        # It's likely in ZONA DE JUEGOS because it was added after robotica which is in arcade keys list
        # Wait, I added 'secuencias' to ACTIVITIES_DATA but didn't update the ARCADE_KEYS list in renderActivities.
        # Let's check where it appears.
        # If I didn't add it to ARCADE_KEYS, it will appear in ROOT grid (unless filtered out by something else).
        # renderActivities filters: mode='root' hides if isArcade. mode='arcade' hides if !isArcade.
        # 'secuencias' is NOT in ARCADE_KEYS array in my previous edit.
        # So it should be in ROOT grid.

        # Look for card with "Secuencias"
        seq_card = page.locator('div.area-card:has-text("Secuencias")')
        if seq_card.count() > 0:
            print("Found Secuencias card in Root")
            seq_card.click()
        else:
            print("Secuencias card not found in Root. Checking Arcade...")
            folder = page.locator('div.area-card:has-text("ZONA DE JUEGOS")')
            if folder.count() > 0:
                folder.click()
                page.wait_for_timeout(500)
                seq_card = page.locator('div.area-card:has-text("Secuencias")')
                if seq_card.count() > 0:
                    print("Found Secuencias in Arcade")
                    seq_card.click()
                else:
                    print("FAILURE: Secuencias card not found anywhere")
                    page.screenshot(path='verification/seq_fail_find.png')
                    return

        page.wait_for_timeout(1000)
        page.screenshot(path='verification/seq_menu.png')

        # 3. Check Menu (Numbers, Figures, Colors)
        if page.locator('button:has-text("Números 123")').count() > 0:
            print("Menu rendered correctly")
        else:
            print("FAILURE: Menu buttons not found")
            return

        # 4. Play Level 1 (Numbers)
        page.click('button:has-text("Números 123")')
        page.wait_for_timeout(1000)

        # Verify Level 1: 1, 2, 3, ?
        # Check for sequence items
        content = page.locator('#gameArea').inner_text()
        print(f"Level 1 Content: {content}")

        if "1" in content and "2" in content and "3" in content:
            print("Sequence [1, 2, 3] found")
        else:
            print("FAILURE: Sequence content missing")

        page.screenshot(path='verification/seq_level1.png')

        # 5. Answer Correctly (4)
        page.click('button:has-text("4")')
        page.wait_for_timeout(1000)

        # Check Feedback
        if page.locator('text=Correcto').count() > 0 or page.locator('text=Correcto!').count() > 0:
             print("Feedback visible")
        else:
             print("Feedback NOT visible (might have faded)")

        page.screenshot(path='verification/seq_success.png')

        browser.close()

if __name__ == '__main__':
    check_sequence_game()
