import os
from playwright.sync_api import sync_playwright

def verify_games():
    cwd = os.getcwd()
    file_path = f"file://{cwd}/indexdino.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print(f"Loading {file_path}")
        page.goto(file_path)

        # 1. Start Kid Zone
        print("Entering Kid Zone...")
        page.wait_for_selector("#btnStartKid")
        page.click("#btnStartKid")
        page.wait_for_selector("#view-kid-dash:not(.hidden)")
        page.wait_for_selector("#activitiesGrid")

        # 2. Check Clock Game
        print("Checking Clock Game...")
        page.click(".area-card[data-key='reloj']")
        page.wait_for_selector("#view-game:not(.hidden)")

        # Ensure title text
        title = page.inner_text("#gameTitle")
        print(f"Game Title: {title}")

        page.wait_for_timeout(1000)
        page.screenshot(path="verification/clock_game.png")

        # Go back - Scope to visible game view
        print("Going back...")
        page.click("#view-game button.nav-btn")
        page.wait_for_selector("#activitiesGrid")

        # 3. Check Goose Game
        print("Checking Goose Game...")
        page.click("div.area-card:has-text('ZONA DE JUEGOS')")
        page.wait_for_selector(".area-card[data-key='oca']")

        page.click(".area-card[data-key='oca']")
        page.wait_for_selector("#view-game:not(.hidden)")
        title = page.inner_text("#gameTitle")
        print(f"Game Title: {title}")

        page.wait_for_timeout(1000)
        page.screenshot(path="verification/goose_game.png")

        browser.close()

if __name__ == "__main__":
    verify_games()
