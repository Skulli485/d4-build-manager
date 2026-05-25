import os
import sys
import json
import subprocess
from pathlib import Path

# Fix encoding for Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer, "strict")
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.buffer, "strict")

API_KEY = "1839ae0b9e89fad3f194f6853811cc69713fb8fd8159dbaebbc9dc3ab9a0564c"
SITE_DIR = Path(r"c:\Users\Mandy\Documents\d4-build-manager\site")
SLUG = "golden-huckle-ztp9"
BASE_URL = "https://here.now/api/v1"

def get_files():
    """Get all files relative to site directory"""
    files = []
    for item in SITE_DIR.rglob("*"):
        if item.is_file():
            rel_path = item.relative_to(SITE_DIR)
            files.append((str(rel_path).replace("\\", "/"), str(item)))
    return sorted(files)

def curl_request(url, method="GET", data=None, headers=None):
    """Execute curl request"""
    cmd = ["curl", "-s", "-X", method, url]
    if headers:
        for k, v in headers.items():
            cmd.extend(["-H", f"{k}: {v}"])
    if data:
        cmd.extend(["-d", data])

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout, result.stderr, result.returncode

def main():
    print(f"🚀 Starting upload to {SLUG}.here.now...")

    # Step 1: Create/update site
    print("\n📋 Step 1: Creating site...")
    url = f"{BASE_URL}/publish"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = json.dumps({"slug": SLUG})

    stdout, stderr, code = curl_request(url, "POST", data, headers)

    if code != 0:
        print(f"❌ Error creating site: {stderr}")
        return

    response = json.loads(stdout)
    print(f"✅ Site created/updated: {response.get('siteUrl', url)}")

    # Check if upload is needed
    if response.get("upload"):
        upload_info = response["upload"]
        version_id = upload_info["versionId"]
        upload_url = upload_info.get("uploadUrl") or upload_info.get("finalizeUrl", "").replace("/finalize", "/upload")

        # Step 2: Upload files
        print(f"\n📦 Step 2: Uploading files...")

        # Create manifest
        files = get_files()
        manifest = []
        for rel_path, full_path in files:
            file_size = os.path.getsize(full_path)
            content_type = "text/html"
            if rel_path.endswith(".png"):
                content_type = "image/png"
            elif rel_path.endswith(".svg"):
                content_type = "image/svg+xml"
            elif rel_path.endswith(".json"):
                content_type = "application/json"
            elif rel_path.endswith(".md"):
                content_type = "text/markdown"

            manifest.append({
                "path": rel_path,
                "size": file_size,
                "contentType": content_type
            })

        # Get upload URLs for all files
        upload_data = json.dumps({"files": manifest})
        upload_response, _, upload_code = curl_request(
            f"{BASE_URL}/publish/{SLUG}/upload",
            "POST",
            upload_data,
            headers
        )

        if upload_code != 0:
            print(f"❌ Error getting upload URLs: {upload_response}")
            return

        upload_info = json.loads(upload_response)
        uploads = upload_info.get("uploads", [])
        skipped = upload_info.get("skipped", [])

        print(f"📊 Files to upload: {len(uploads)}")
        print(f"✓ Files unchanged: {len(skipped)}")

        # Upload each file
        for i, upload in enumerate(uploads[:50]):  # Limit to first 50 for testing
            file_path = upload["path"]
            upload_url = upload["url"]
            method = upload.get("method", "PUT")

            local_file = SITE_DIR / file_path
            if not local_file.exists():
                print(f"⚠️  File not found: {file_path}")
                continue

            # Upload the file
            with open(local_file, "rb") as f:
                file_content = f.read()

            file_headers = {"Content-Type": upload.get("headers", {}).get("Content-Type", "application/octet-stream")}

            result = subprocess.run([
                "curl", "-s", "-X", method, upload_url,
                "-H", f"Content-Type: {file_headers['Content-Type']}",
                "--data-binary", f"@{local_file}"
            ], capture_output=True)

            if result.returncode == 0:
                print(f"✓ [{i+1}/{len(uploads)}] {file_path}")
            else:
                print(f"❌ [{i+1}/{len(uploads)}] {file_path}: {result.stderr.decode()}")

        # Step 3: Finalize
        print(f"\n🎯 Step 3: Finalizing...")
        version_id = upload_info.get("versionId", version_id)
        finalize_url = f"{BASE_URL}/publish/{SLUG}/finalize"

        finalize_data = json.dumps({"versionId": version_id})
        finalize_response, _, finalize_code = curl_request(finalize_url, "POST", finalize_data, headers)

        if finalize_code == 0:
            result = json.loads(finalize_response)
            print(f"\n✅ Site published!")
            print(f"🌐 URL: {result.get('siteUrl', f'https://{SLUG}.here.now')}")
        else:
            print(f"❌ Error finalizing: {finalize_response}")
    else:
        print("ℹ️  Site already up to date")

if __name__ == "__main__":
    main()
