#!/usr/bin/env python3
"""
Simple here.now uploader without jq dependency
"""
import os
import sys
import json
import subprocess
import hashlib
from pathlib import Path

API_KEY = "1839ae0b9e89fad3f194f6853811cc69713fb8fd8159dbaebbc9dc3ab9a0564c"
SITE_DIR = Path(r"c:\Users\Mandy\Documents\d4-build-manager\site")
SLUG = "golden-huckle-ztp9"

def sha256_file(filepath):
    """Compute SHA256 hash of a file"""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest()

def get_content_type(filepath):
    """Guess content type from extension"""
    ext = filepath.suffix.lower()
    types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.md': 'text/plain; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.ttf': 'font/ttf',
    }
    return types.get(ext, 'application/octet-stream')

def build_manifest():
    """Build file manifest for here.now upload"""
    files = []

    for filepath in SITE_DIR.rglob('*'):
        if filepath.is_file():
            # Skip certain files
            if '.DS_Store' in filepath.parts:
                continue

            rel_path = str(filepath.relative_to(SITE_DIR)).replace('\\', '/')
            size = filepath.stat().st_size
            ct = get_content_type(filepath)
            hash_val = sha256_file(filepath)

            files.append({
                "path": rel_path,
                "size": size,
                "contentType": ct,
                "hash": hash_val
            })

    return files

def curl_json(url, method, data=None):
    """Make JSON request via curl"""
    cmd = ['curl', '-s', '-X', method,
           '-H', f'Authorization: Bearer {API_KEY}',
           '-H', 'Content-Type: application/json',
           url]

    if data:
        # Write data to temp file to avoid command line length issues
        temp_path = SITE_DIR / '.temp_upload_body.json'
        with open(temp_path, 'w') as f:
            f.write(data)
        cmd.extend(['-d', f'@{temp_path}'])

    result = subprocess.run(cmd, capture_output=True, text=True)

    # Clean up temp file
    if data and (SITE_DIR / '.temp_upload_body.json').exists():
        (SITE_DIR / '.temp_upload_body.json').unlink()

    return result.stdout, result.stderr, result.returncode

def curl_upload(url, filepath, content_type):
    """Upload a single file"""
    cmd = ['curl', '-s', '-X', 'PUT',
           '-H', f'Content-Type: {content_type}',
           '--data-binary', f'@{filepath}',
           url]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def main():
    print(f"Building manifest for {SITE_DIR}...")

    files = build_manifest()
    print(f"Found {len(files)} files")

    # Create request body
    body = json.dumps({"files": files}, indent=2)

    print(f"Creating upload for {SLUG}.here.now...")

    # Step 1: Create upload
    url = f"https://here.now/api/v1/publish/{SLUG}"
    stdout, stderr, code = curl_json(url, "PUT", body)

    if code != 0:
        print(f"Error: {stderr}")
        sys.exit(1)

    response = json.loads(stdout)

    # Check for errors
    if 'error' in response:
        print(f"API Error: {response['error']}")
        if 'details' in response:
            print(f"Details: {response['details']}")
        sys.exit(1)

    # Get upload info
    upload_info = response.get('upload', {})
    uploads = upload_info.get('uploads', [])
    skipped = upload_info.get('skipped', [])
    version_id = upload_info.get('versionId', '')

    print(f"Version: {version_id}")
    print(f"Files to upload: {len(uploads)}")
    print(f"Files unchanged: {len(skipped)}")

    # Step 2: Upload files
    for i, upload in enumerate(uploads):
        path = upload['path']
        upload_url = upload['url']
        content_type = upload.get('headers', {}).get('Content-Type', 'application/octet-stream')

        local_file = SITE_DIR / path

        if not local_file.exists():
            print(f"[{i+1}/{len(uploads)}] SKIP: {path} (not found)")
            continue

        if curl_upload(upload_url, local_file, content_type):
            print(f"[{i+1}/{len(uploads)}] OK: {path}")
        else:
            print(f"[{i+1}/{len(uploads)}] FAIL: {path}")

    # Step 3: Finalize
    print(f"\nFinalizing...")
    finalize_url = f"https://here.now/api/v1/publish/{SLUG}/finalize"
    finalize_body = json.dumps({"versionId": version_id})

    stdout, stderr, code = curl_json(finalize_url, "POST", finalize_body)

    if code == 0:
        result = json.loads(stdout)
        print(f"\n=== UPLOAD COMPLETE ===")
        print(f"URL: https://{SLUG}.here.now/")
        if 'status' in result:
            print(f"Status: {result['status']}")
    else:
        print(f"Error finalizing: {stderr}")

if __name__ == "__main__":
    main()
