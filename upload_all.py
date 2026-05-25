import sys
import json
import subprocess
from pathlib import Path

API_KEY = "1839ae0b9e89fad3f194f6853811cc69713fb8fd8159dbaebbc9dc3ab9a0564c"
SITE_DIR = Path(r"c:\Users\Mandy\Documents\d4-build-manager\site")
SLUG = "golden-huckle-ztp9"
BASE_URL = "https://here.now/api/v1"

def get_content_type(path):
    """Get content type based on file extension"""
    if path.endswith(".html"):
        return "text/html"
    elif path.endswith(".png"):
        return "image/png"
    elif path.endswith(".svg"):
        return "image/svg+xml"
    elif path.endswith(".json"):
        return "application/json"
    elif path.endswith(".md"):
        return "text/markdown"
    else:
        return "application/octet-stream"

def main():
    print(f"Preparing upload for {SLUG}.here.now...")

    # Collect all files
    files = []
    for item in SITE_DIR.rglob("*"):
        if item.is_file():
            rel_path = str(item.relative_to(SITE_DIR)).replace("\\", "/")
            size = item.stat().st_size
            files.append({
                "path": rel_path,
                "size": size,
                "contentType": get_content_type(rel_path)
            })

    print(f"Found {len(files)} files to upload")

    # Request upload URLs
    manifest_data = json.dumps({"files": files})

    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        "-H", f"Authorization: Bearer {API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", manifest_data,
        f"{BASE_URL}/publish/{SLUG}/upload"
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error requesting upload URLs: {result.stderr}")
        return

    response = json.loads(result.stdout)

    # Get version ID for finalize
    version_id = response.get("versionId", "")
    print(f"Version ID: {version_id}")

    uploads = response.get("uploads", [])
    skipped = response.get("skipped", [])

    print(f"Files to upload: {len(uploads)}")
    print(f"Files unchanged: {len(skipped)}")

    if not uploads and not skipped:
        print("No upload info - site may be up to date")
        return

    # Upload each file
    for i, upload in enumerate(uploads):
        file_path = upload["path"]
        upload_url = upload["url"]
        method = upload.get("method", "PUT")
        headers = upload.get("headers", {})

        local_file = SITE_DIR / file_path
        if not local_file.exists():
            print(f"[{i+1}/{len(uploads)}] SKIP: {file_path} (not found)")
            continue

        # Build curl command
        cmd = ["curl", "-s", "-X", method, upload_url]
        for k, v in headers.items():
            cmd.extend(["-H", f"{k}: {v}"])
        cmd.extend(["--data-binary", f"@{local_file}"])

        result = subprocess.run(cmd, capture_output=True)

        if result.returncode == 0:
            print(f"[{i+1}/{len(uploads)}] OK: {file_path}")
        else:
            print(f"[{i+1}/{len(uploads)}] FAIL: {file_path}")

    # Finalize
    print(f"\nFinalizing upload...")
    finalize_data = json.dumps({"versionId": version_id})

    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        "-H", f"Authorization: Bearer {API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", finalize_data,
        f"{BASE_URL}/publish/{SLUG}/finalize"
    ], capture_output=True, text=True)

    if result.returncode == 0:
        response = json.loads(result.stdout)
        print(f"\n=== UPLOAD COMPLETE ===")
        print(f"URL: https://{SLUG}.here.now/")
        print(f"Status: {response.get('status', 'unknown')}")
    else:
        print(f"Error finalizing: {result.stderr}")

if __name__ == "__main__":
    main()
