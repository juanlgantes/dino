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

        # Enter Kid Zone
        page.click("#btnStartKid")

        # Wait for grid
        page.wait_for_selector("#activitiesGrid")

        # Click "Biblioteca Mágica" (QuizGame) - Key is 'comunicacion'
        # Or look for text "Biblioteca Mágica"
        page.click("div[data-key='comunicacion']")

        # Wait for game view
        page.wait_for_selector("#view-game:not(.hidden)")

        # Wait for question card
        page.wait_for_selector(".quiz-container")

        # Take screenshot
        page.screenshot(path="verification/quiz_stop_btn.png")

        # Check for button
        content = page.content()
        if "🤫" in content:
            print("SUCCESS: Stop button found in QuizGame")
        else:
            print("FAILURE: Stop button not found")

        browser.close()

if __name__ == "__main__":
    run()
