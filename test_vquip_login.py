from playwright.sync_api import sync_playwright, expect
import time

def test_vquip_login():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Step 1: Navigate to the welcome page
            print("Step 1: Navigating to welcome page...")
            page.goto("https://dev-admin.vquiprentals.com/auth/v2/welcome")
            
            # Step 2: Enter Company ID
            print("Step 2: Entering Company ID...")
            company_id_input = page.locator("#companyId")
            company_id_input.wait_for(state="visible")
            company_id_input.fill("244")
            
            # Step 3: Click Next
            print("Step 3: Clicking Next button...")
            next_button = page.locator("button:has-text('Next')")
            next_button.wait_for(state="visible")
            next_button.click()
            
            # Step 4: Enter Username
            print("Step 4: Entering username...")
            username_input = page.locator("#username")
            username_input.wait_for(state="visible")
            username_input.fill("oscaremp")
            
            # Step 5: Enter Password
            print("Step 5: Entering password...")
            password_input = page.locator("#password")
            password_input.wait_for(state="visible")
            password_input.fill("Password1!")
            
            # Step 6: Click Sign In
            print("Step 6: Clicking Sign In button...")
            sign_in_button = page.locator("button:has-text('Sign In')")
            sign_in_button.wait_for(state="visible")
            sign_in_button.click()
            
            # Step 7: Verify Redirection
            print("Step 7: Verifying redirection...")
            # Wait for navigation to complete
            page.wait_for_load_state("networkidle")
            
            # Get current URL
            current_url = page.url
            print(f"Current URL: {current_url}")
            
            # Assert the expected URL
            expected_url = "https://dev-admin.vquiprentals.com/secure/scheduler"
            assert current_url == expected_url, f"Expected URL: {expected_url}, but got: {current_url}"
            
            print("✅ Test passed! Successfully logged in and redirected to scheduler.")
            
            # Wait a moment to see the result
            time.sleep(3)
            
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            # Take a screenshot for debugging
            page.screenshot(path="test_failure.png")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    test_vquip_login() 