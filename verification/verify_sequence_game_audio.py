import os
from playwright.sync_api import sync_playwright

def check_sequence_game_audio():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        path = os.path.abspath('index.html')
        page.goto(f'file://{path}')

        # 1. Start App
        page.click('#btnStartKid')
        page.wait_for_timeout(500)

        # 2. Navigate to Secuencias
        # Assuming it's in Root (verified previously)
        seq_card = page.locator('div.area-card:has-text("Secuencias")')
        if seq_card.count() == 0:
             page.click('div.area-card:has-text("ZONA DE JUEGOS")')
             page.wait_for_timeout(500)
             seq_card = page.locator('div.area-card:has-text("Secuencias")')

        seq_card.click()
        page.wait_for_timeout(1000)

        # 3. Enter Level 1
        page.click('button:has-text("Números 123")')
        page.wait_for_timeout(1000)

        # 4. Check for Speaker Button inside gameArea
        # The global mute button is in nav, so we target inside #gameArea
        speaker = page.locator('#gameArea button:has-text("🔊")')
        if speaker.count() > 0:
            print("Speaker button found in Game Area")
            speaker.click()
            print("Speaker button clicked successfully")
        else:
            print("FAILURE: Speaker button not found in Game Area")
            page.screenshot(path='verification/seq_audio_fail.png')
            return

        page.screenshot(path='verification/seq_audio_success.png')
        browser.close()

if __name__ == '__main__':
    check_sequence_game_audio()
