from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup


@dataclass
class ScrapedPage:
    title: str
    url: str
    text: str


def _normalize_url(raw_url: str) -> str:
    parsed = urlparse(raw_url.strip())
    path = parsed.path or "/"
    normalized = parsed._replace(fragment="", query="", path=path.rstrip("/") or "/")
    return urlunparse(normalized)


def _is_same_domain(url: str, base_domain: str) -> bool:
    return urlparse(url).netloc == base_domain


def _extract_visible_text(soup: BeautifulSoup) -> str:
    chunks: list[str] = []
    for tag in soup.select("article p, main p, p, li"):
        text = " ".join(tag.get_text(" ", strip=True).split())
        if text:
            chunks.append(text)
    return "\n".join(chunks)


def _extract_title(soup: BeautifulSoup, fallback: str) -> str:
    if soup.title and soup.title.text.strip():
        return soup.title.text.strip()
    h1 = soup.find("h1")
    if h1 and h1.get_text(strip=True):
        return h1.get_text(strip=True)
    return fallback


def _fetch_html(url: str, timeout_seconds: int = 20) -> str:
    response = requests.get(
        url,
        timeout=timeout_seconds,
        headers={
            "User-Agent": "TopicMapBot/0.1 (+https://topicmap.ai)",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    response.raise_for_status()
    return response.text


def _extract_sitemap_urls(home_url: str, max_pages: int) -> list[str]:
    parsed_home = urlparse(home_url)
    base = f"{parsed_home.scheme}://{parsed_home.netloc}"
    candidates = [urljoin(base, "/sitemap.xml")]

    try:
        robots_txt = requests.get(urljoin(base, "/robots.txt"), timeout=10)
        if robots_txt.ok:
            for line in robots_txt.text.splitlines():
                if line.lower().startswith("sitemap:"):
                    sitemap_url = line.split(":", 1)[1].strip()
                    if sitemap_url:
                        candidates.append(sitemap_url)
    except requests.RequestException:
        pass

    seen: set[str] = set()
    urls: list[str] = []
    domain = parsed_home.netloc

    for sitemap_url in candidates:
        try:
            xml_text = requests.get(sitemap_url, timeout=15).text
        except requests.RequestException:
            continue

        soup = BeautifulSoup(xml_text, "xml")
        for loc in soup.find_all("loc"):
            link = loc.get_text(strip=True)
            if not link:
                continue
            normalized = _normalize_url(link)
            if normalized in seen or not _is_same_domain(normalized, domain):
                continue
            seen.add(normalized)
            urls.append(normalized)
            if len(urls) >= max_pages:
                return urls

    return urls


def _extract_internal_links(home_url: str, max_pages: int) -> list[str]:
    domain = urlparse(home_url).netloc
    try:
        html = _fetch_html(home_url)
    except requests.RequestException:
        return [_normalize_url(home_url)]

    soup = BeautifulSoup(html, "html.parser")
    links: list[str] = [_normalize_url(home_url)]
    seen: set[str] = set(links)

    for anchor in soup.find_all("a", href=True):
        absolute = urljoin(home_url, anchor["href"])
        normalized = _normalize_url(absolute)
        if normalized in seen or not _is_same_domain(normalized, domain):
            continue
        seen.add(normalized)
        links.append(normalized)
        if len(links) >= max_pages:
            break

    return links


def _iter_candidate_urls(home_url: str, max_pages: int) -> Iterable[str]:
    sitemap_urls = _extract_sitemap_urls(home_url, max_pages=max_pages)
    if sitemap_urls:
        return sitemap_urls
    return _extract_internal_links(home_url, max_pages=max_pages)


def scrape_site(home_url: str, max_pages: int = 30, min_text_chars: int = 200) -> list[ScrapedPage]:
    pages: list[ScrapedPage] = []
    for candidate_url in _iter_candidate_urls(home_url, max_pages=max_pages):
        try:
            html = _fetch_html(candidate_url)
        except requests.RequestException:
            continue

        soup = BeautifulSoup(html, "html.parser")
        text = _extract_visible_text(soup)
        if len(text) < min_text_chars:
            continue

        title = _extract_title(soup, fallback=candidate_url)
        pages.append(ScrapedPage(title=title, url=candidate_url, text=text))

        if len(pages) >= max_pages:
            break

    return pages
