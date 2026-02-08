from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        pwd = os.getcwd()
        page.goto(f"file://{pwd}/index.html")

        # Start game
        page.evaluate("window.app.startGame('oca')")
        page.evaluate("window.app.gameInstance.startGame('pve')")

        page.wait_for_selector(".goose-board", state="attached")
        page.wait_for_timeout(1000)

        page.screenshot(path="verification/goose_board_verified.png")
        print("Screenshot saved to verification/goose_board_verified.png")

        browser.close()

if __name__ == "__main__":
    run()
