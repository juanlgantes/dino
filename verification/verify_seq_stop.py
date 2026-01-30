from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        page.goto(f"file://{os.getcwd()}/index.html")

        # Wait for app
        page.wait_for_selector("#btnStartKid")
        page.click("#btnStartKid")

        # Wait for grid
        page.wait_for_selector("#activitiesGrid")

        # Click "Secuencias" (SequenceGame) - Key is 'secuencias'
        page.click("div[data-key='secuencias']")

        # Wait for game view
        page.wait_for_selector("#view-game:not(.hidden)")

        # Sequence Game has a menu first.
        # Wait for "Números 123" button
        page.wait_for_selector("button:has-text('Números 123')")
        page.click("button:has-text('Números 123')")

        # Wait for level rendering (seqDiv)
        page.wait_for_timeout(1000) # Wait for animation/render

        # Take screenshot
        page.screenshot(path="verification/sequence_stop_btn.png")

        # Check for button
        content = page.content()
        if "🤫" in content:
            print("SUCCESS: Stop button found in SequenceGame")
        else:
            print("FAILURE: Stop button not found")

        browser.close()

if __name__ == "__main__":
    run()
