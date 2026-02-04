from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # 1. Click Kid Zone
        page.click("#btnStartKid")

        # 2. Wait for Dashboard and Click "ZONA DE JUEGOS"
        page.wait_for_selector("#activitiesGrid")

        # Find the Games Folder Card
        games_card = page.locator(".area-card").filter(has_text="ZONA DE JUEGOS")
        games_card.wait_for()
        games_card.click()

        # 3. Wait for Arcade Grid
        # Check if new games are present
        mem_card = page.locator(".area-card").filter(has_text="Memorama Dino")
        mem_card.wait_for()

        # Take screenshot of the Arcade Menu
        page.screenshot(path="verification/arcade_menu.png")
        print("Screenshot of Arcade Menu taken.")

        # 4. Enter Memory Game
        mem_card.click()

        # Wait for Game UI (specific H2 inside gameArea)
        # The game writes to #gameArea
        # Logic: MemoryGame.init() creates an h2
        title = page.locator("#gameArea h2").filter(has_text="Memorama Dino")
        title.wait_for()

        # Take screenshot of Memory Game Menu
        page.screenshot(path="verification/memory_game.png")
        print("Screenshot of Memory Game taken.")

        browser.close()

if __name__ == "__main__":
    run()
