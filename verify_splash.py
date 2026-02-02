
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Load the local HTML file
        page.goto(f"file://{os.getcwd()}/indexdino.html")

        # Wait for splash
        page.wait_for_selector("#view-splash")

        # Take screenshot of splash
        page.screenshot(path="/home/jules/verification/splash_fix.png")

        browser.close()

if __name__ == "__main__":
    run()
