import os
from playwright.sync_api import sync_playwright

def check_goose():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Explicitly set without preset to be sure
        context = browser.new_context(viewport={'width': 667, 'height': 375})
        page = context.new_page()
        path = os.path.abspath('index.html')
        page.goto(f'file://{path}')

        # Check viewport
        dims = page.evaluate("() => ({w: window.innerWidth, h: window.innerHeight, media: window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches})")
        print(f"Viewport: {dims}")

        try:
            # Navigate to Game (Shortest path: reload directly into game if possible? No, state needed.)
            page.click('#btnStartKid')
            page.wait_for_timeout(500)

            # Open Folder
            folder = page.locator('div.area-card:has-text("ZONA DE JUEGOS")')
            if folder.count() > 0:
                folder.click()
                page.wait_for_timeout(500)

            page.click('div.area-card:has-text("Oca")')
            page.wait_for_timeout(1000)
            page.click('button:has-text("1 Jugador")')
            page.wait_for_timeout(1000)

            # Check size
            container = page.locator('.goose-container') # This is inside gameArea
            gameArea = page.locator('#gameArea')

            c_box = container.bounding_box()
            ga_box = gameArea.bounding_box()
            board_box = page.locator('.goose-board').bounding_box()

            print(f"GameArea Box: {ga_box}")
            print(f"Container Box: {c_box}")
            print(f"Board Box: {board_box}")

            # Validation
            if board_box['height'] > dims['h']:
                print("FAILURE: Board taller than viewport")
            elif board_box['height'] > ga_box['height']:
                 print("WARNING: Board taller than GameArea (scrolling needed?)")
            else:
                print("SUCCESS: Board fits")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path='verification/goose_debug.png')

        finally:
            browser.close()

if __name__ == '__main__':
    check_goose()
