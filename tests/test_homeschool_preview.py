#!/usr/bin/env python3
"""Regression checks for the noindex Homeschool BJJ review page."""

from __future__ import annotations

import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
PAGE = SITE / "homeschool-bjj-dripping-springs-preview.html"
MANIFEST = SITE / "campaign" / "seo-pages.json"


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.sources: list[str] = []
        self.h1_count = 0
        self.in_body = False
        self.body_text: list[str] = []
        self.forms: list[dict[str, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "body":
            self.in_body = True
        if values.get("id"):
            self.ids.add(str(values["id"]))
        if tag == "a" and values.get("href"):
            self.links.append(str(values["href"]))
        if tag in {"img", "script"} and values.get("src"):
            self.sources.append(str(values["src"]))
        if tag == "link" and values.get("href"):
            href = str(values["href"])
            if values.get("rel") != "canonical":
                self.sources.append(href)
        if tag == "h1":
            self.h1_count += 1
        if tag == "form":
            self.forms.append(values)

    def handle_endtag(self, tag: str) -> None:
        if tag == "body":
            self.in_body = False

    def handle_data(self, data: str) -> None:
        if self.in_body:
            self.body_text.append(data)


class HomeschoolPreviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = PAGE.read_text(encoding="utf-8")
        cls.parser = PageParser()
        cls.parser.feed(cls.source)

    def test_review_page_is_safe_and_single_purpose(self) -> None:
        self.assertIn('<meta name="robots" content="noindex,nofollow">', self.source)
        self.assertEqual(self.parser.h1_count, 1)
        self.assertNotIn('type="application/ld+json"', self.source)
        self.assertIn("Review concept", self.source)
        self.assertIn("does not send or store information", self.source)

    def test_confirmed_program_facts_are_present(self) -> None:
        required = (
            "Ages 5–8",
            "Tuesday + Thursday",
            "10:30–11:15 AM",
            "120 Frog Pond Lane, Suite 200",
            'data-default-program="homeschool"',
            'data-default-location="ds"',
        )
        for fact in required:
            with self.subTest(fact=fact):
                self.assertIn(fact, self.source)

    def test_preview_form_cannot_transmit(self) -> None:
        self.assertEqual(len(self.parser.forms), 1)
        form = self.parser.forms[0]
        self.assertIn("data-preview-form", form)
        self.assertNotIn("data-form", form)
        self.assertNotIn("action", form)
        self.assertNotIn("/api/contact.php", self.source)
        self.assertIn("event.preventDefault()", self.source)
        self.assertIn("was not sent or stored", self.source)

    def test_no_body_copy_em_dash(self) -> None:
        body_text = " ".join(self.parser.body_text)
        self.assertNotIn("—", body_text)

    def test_local_links_and_assets_resolve(self) -> None:
        local_references = self.parser.links + self.parser.sources
        for reference in local_references:
            parsed = urlsplit(reference)
            if parsed.scheme or reference.startswith(("tel:", "mailto:", "#", "//")):
                continue
            path = parsed.path
            if not path:
                continue
            target = (SITE / path).resolve()
            with self.subTest(reference=reference):
                self.assertTrue(target.exists(), f"Missing local target: {reference}")

    def test_fragment_links_have_targets(self) -> None:
        for href in self.parser.links:
            if not href.startswith("#") or href == "#":
                continue
            with self.subTest(href=href):
                self.assertIn(href[1:], self.parser.ids)

    def test_preview_is_not_in_production_manifest(self) -> None:
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        files = {page["file"] for page in manifest["pages"]}
        self.assertNotIn(PAGE.name, files)
        self.assertNotRegex(MANIFEST.read_text(encoding="utf-8"), re.escape("homeschool-bjj-dripping-springs"))


if __name__ == "__main__":
    unittest.main()
