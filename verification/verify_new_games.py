import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()
        url = f"file://{cwd}/indexdino.html"
        print(f"Loading {url}")
        page.goto(url)

        # Click Start Kid
        page.click("#btnStartKid")

        # Wait for grid
        page.wait_for_selector("#view-kid-dash:not(.hidden)")

        # Open Arcade Folder
        print("Opening Arcade Folder...")
        page.click("div.area-card:has-text('ZONA DE JUEGOS')")

        # Verify New Games are present in Arcade Mode
        # We need to verify Memory, Simon, Whack, Arkanoid, Sorting

        # Memory
        print("Checking Memory...")
        page.wait_for_selector("div[data-key='memory']")

        # Simon
        print("Checking Simon...")
        page.wait_for_selector("div[data-key='simon']")

        # Whack
        print("Checking Whack...")
        page.wait_for_selector("div[data-key='whack']")

        # Arkanoid
        print("Checking Arkanoid...")
        page.wait_for_selector("div[data-key='arkanoid']")

        # Sorting
        print("Checking Sorting...")
        page.wait_for_selector("div[data-key='sorting']")

        # Screenshot the arcade menu with new games
        page.screenshot(path="verification/new_games_arcade.png")
        print("Screenshot saved.")

        # Optional: Enter one game (Memory) and screenshot
        page.click("div[data-key='memory']")
        page.wait_for_selector(".memory-card")
        page.screenshot(path="verification/game_memory.png")
        print("Memory Game Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
