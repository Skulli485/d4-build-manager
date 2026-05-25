import sys
import json
import subprocess
import os

API_KEY = "1839ae0b9e89fad3f194f6853811cc69713fb8fd8159dbaebbc9dc3ab9a0564c"
SLUG = "golden-huckle-ztp9"
BASE_URL = "https://here.now/api/v1"

def check_site():
    """Check current site status"""
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }

    # Get site info
    result = subprocess.run([
        "curl", "-s",
        "-H", f"Authorization: Bearer {API_KEY}",
        f"{BASE_URL}/publish/{SLUG}"
    ], capture_output=True, text=True)

    print("Site Status:")
    print(result.stdout)

    # Try to get a list of files on the site
    result2 = subprocess.run([
        "curl", "-s",
        "-H", f"Authorization: Bearer {API_KEY}",
        f"{BASE_URL}/sites/{SLUG}"
    ], capture_output=True, text=True)

    print("\nSite Info:")
    print(result2.stdout)

if __name__ == "__main__":
    check_site()
