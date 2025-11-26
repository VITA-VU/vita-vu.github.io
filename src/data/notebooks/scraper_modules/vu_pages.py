# small static helpers for vu nl pages
# notes: uses requests cache in a folder that you already set up
import requests, re
from pathlib import Path
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0"}

class VuPages:
    def __init__(self, cache_dir: Path):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _cache_path(self, url):
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", url.strip("/"))[:180]
        return self.cache_dir / f"{slug}.html"

    def _soup(self, url):
        fp = self._cache_path(url)
        if fp.exists():
            return BeautifulSoup(fp.read_text(encoding="utf-8", errors="ignore"), "lxml")
        r = requests.get(url, headers=HEADERS, timeout=25)
        r.raise_for_status()
        fp.write_text(r.text, encoding="utf-8")
        return BeautifulSoup(r.text, "lxml")

    def discover(self, base_url, want):
        slug_map = {
            "curriculum": ["curriculum", "study-programme", "programme", "program"],
            "future": ["future", "your-future-career", "career"],
            "admissions": ["admissions", "admission", "how-to-apply", "apply"],
        }
        for slug in slug_map.get(want, []):
            url = base_url.rstrip("/") + "/" + slug
            try:
                soup = self._soup(url)
                if soup:
                    return url, soup
            except Exception:
                continue
        soup = self._soup(base_url)
        want_words = {
            "curriculum": ["curriculum", "study programme", "courses"],
            "future": ["future", "career", "after graduation"],
            "admissions": ["admissions", "admission", "apply"],
        }[want]
        for a in soup.select("a[href]"):
            txt = a.get_text(" ", strip=True).lower()
            href = a.get("href", "")
            if any(w in txt for w in want_words) or any(w in href.lower() for w in want_words):
                url = href if href.startswith("http") else base_url.rstrip("/") + "/" + href.lstrip("/")
                try:
                    soup2 = self._soup(url)
                    if soup2:
                        return url, soup2
                except Exception:
                    continue
        return None, None
