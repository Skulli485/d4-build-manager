import sys
import json
import subprocess
import tempfile
from pathlib import Path

API_KEY = "1839ae0b9e89fad3f194f6853811cc69713fb8fd8159dbaebbc9dc3ab9a0564c"
SITE_DIR = Path(r"c:\Users\Mandy\Documents\d4-build-manager\site")
SLUG = "golden-huckle-ztp9"
BASE_URL = "https://here.now/api/v1"

def get_content_type(path):
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

def curl_with_data(url, method, headers, data_str):
    """Execute curl with data from temp file to avoid command line length issues"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        f.write(data_str)
        temp_file = f.name

    try:
        # Build command
        cmd = [
            "curl", "-s", "-X", method,
            "-H", f"Authorization: Bearer {API_KEY}",
            "-H", "Content-Type: application/json",
            "-d", f"@{temp_file}",
            url
        ]

        result = subprocess.run(cmd, capture_output=True)
        return result.stdout, result.stderr, result.returncode
    finally:
        try:
            os.unlink(temp_file)
        except:
            pass

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

    stdout, stderr, code = curl_with_data(
        f"{BASE_URL}/publish/{SLUG}/upload",
        "POST",
        {},  # headers added in function
        manifest_data
    )

    if code != 0:
        print(f"Error requesting upload URLs: {stderr}")
        return

    response = json.loads(stdout)

    version_id = response.get("versionId", "")
    print(f"Version ID: {version_id}")

    uploads = response.get("uploads", [])
    skipped = response.get("skipped", [])

    print(f"Files to upload: {len(uploads)}")
    print(f"Files unchanged: {len(skipped)}")

    # Upload each file (limit to first 100 for now)
    upload_count = 0
    for i, upload in enumerate(uploads[:100]):
        file_path = upload["path"]
        upload_url = upload["url"]
        method = upload.get("method", "PUT")
        headers = upload.get("headers", {})

        local_file = SITE_DIR / file_path
        if not local_file.exists():
            print(f"[{i+1}/{min(100, len(uploads))}] SKIP: {file_path}")
            continue

        # Build curl command for file upload
        cmd = ["curl", "-s", "-X", method, upload_url]

        content_type = headers.get("Content-Type", "application/octet-stream")
        cmd.extend(["-H", f"Content-Type: {content_type}"])
        cmd.extend(["--data-binary", f"@{local_file}"])

        result = subprocess.run(cmd, capture_output=True)

        if result.returncode == 0:
            print(f"[{i+1}/{min(100, len(uploads))}] OK: {file_path}")
            upload_count += 1
        else:
            print(f"[{i+1}/{min(100, len(uploads))}] FAIL: {file_path}")

    print(f"\nUploaded {upload_count} files")

    # Finalize
    print(f"Finalizing upload...")

    finalize_data = json.dumps({"versionId": version_id})

    stdout, stderr, code = curl_with_data(
        f"{BASE_URL}/publish/{SLUG}/finalize",
        "POST",
        {},
        finalize_data
    )

    if code == 0:
        response = json.loads(stdout)
        print(f"\n=== UPLOAD COMPLETE ===")
        print(f"URL: https://{SLUG}.here.now/")
        print(f"Status: {response.get('status', 'unknown')}")
    else:
        print(f"Error finalizing: {stderr}")

if __name__ == "__main__":
    import os
    main()
