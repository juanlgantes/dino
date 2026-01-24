
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Open the local test file
        page.goto("file:///home/jules/test_goose_layout.html")

        # Wait for board
        page.wait_for_selector("#testContainer div")

        # Wait a bit for layout to settle (tokens to move)
        page.wait_for_timeout(1000)

        # Check logs (we cannot easily assert logs in screenshot, but we can verify visually)

        # Screenshot
        page.screenshot(path="verification/goose_test.png")
        print("Screenshot saved to verification/goose_test.png")
        browser.close()

if __name__ == "__main__":
    run()
