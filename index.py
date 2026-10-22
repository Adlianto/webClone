import os
import re
import urllib.request
from urllib.parse import urljoin, urlparse

def sanitize_folder_name(name):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', name)

def clone_website(target_url, output_dir=None):
    if not target_url.startswith(('http://', 'https://')):
        target_url = 'https://' + target_url

    parsed_url = urlparse(target_url)
    domain_name = parsed_url.netloc or "cloned_site"
    
    if not output_dir:
        output_dir = os.path.join("downloads", f"cloned_{sanitize_folder_name(domain_name)}")

    assets_dir = os.path.join(output_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"[*] Target URL : {target_url}")
    print(f"[*] Output Dir : {output_dir}")
    print("[*] Mengunduh halaman utama...")

    try:
        req = urllib.request.Request(target_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[!] Gagal mengambil URL target: {e}")
        return
        
    asset_patterns = [
        r'<img[^>]+src=["\']([^"\']+)["\']',
        r'<source[^>]+src=["\']([^"\']+)["\']',
        r'<audio[^>]+src=["\']([^"\']+)["\']',
        r'<video[^>]+src=["\']([^"\']+)["\']',
        r'<link[^>]+href=["\']([^"\']+)["\']',
        r'<script[^>]+src=["\']([^"\']+)["\']',
        r'url\(["\']?([^"\'\)]+)["\']?\)',
        r'["\']([^"\'\s]+\.(?:png|jpg|jpeg|webp|svg|gif|mp3|ogg|wav|ttf|woff|woff2|js|css))["\']'
    ]

    found_assets = set()
    for pattern in asset_patterns:
        matches = re.findall(pattern, html, re.IGNORECASE)
        for m in matches:
            m_clean = m.strip()
            if m_clean.startswith(('data:', '#', 'javascript:')) or not m_clean:
                continue
            found_assets.add(m_clean)

    print(f"[*] Ditemukan {len(found_assets)} potensi file aset. Mulai mengunduh & me-rewrite path...")

    url_to_local_map = {}

    for raw_asset in found_assets:
        full_asset_url = urljoin(target_url, raw_asset)
        asset_parsed = urlparse(full_asset_url)
        raw_filename = os.path.basename(asset_parsed.path)

        if not raw_filename or "." not in raw_filename:
            continue

        clean_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', raw_filename)
        local_file_path = os.path.join(assets_dir, clean_filename)
        rel_web_path = f"assets/{clean_filename}"

        try:
            req_asset = urllib.request.Request(full_asset_url, headers=headers)
            with urllib.request.urlopen(req_asset, timeout=15) as res:
                content = res.read()
                with open(local_file_path, "wb") as f_out:
                    f_out.write(content)
            print(f" [OK] {clean_filename}")
            url_to_local_map[raw_asset] = rel_web_path
        except Exception as e:
            print(f" [SKIP] {clean_filename} ({e})")

    rewritten_html = html
    for original_path, local_rel in url_to_local_map.items():
        rewritten_html = rewritten_html.replace(f'"{original_path}"', f'"{local_rel}"')
        rewritten_html = rewritten_html.replace(f"'{original_path}'", f"'{local_rel}'")
        rewritten_html = rewritten_html.replace(f"({original_path})", f"({local_rel})")

    output_html_path = os.path.join(output_dir, "index.html")
    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(rewritten_html)

    backup_html_path = os.path.join(output_dir, "index_original.html")
    with open(backup_html_path, "w", encoding="utf-8") as f:
        f.write(html)

    print("\n" + "="*50)
    print(f"[✓] Berhasil meng-clone!")
    print(f"[✓] File lokal siap dibuka : {output_html_path}")
    print(f"[✓] File original backup   : {backup_html_path}")
    print(f"[✓] Total aset didownload  : {len(url_to_local_map)} file di folder assets/")
    print("="*50)

if __name__ == "__main__":
    url_input = input("Masukkan URL website target: ").strip()
    if url_input:
        clone_website(url_input)
    else:
        print("[!] URL tidak boleh kosong.")