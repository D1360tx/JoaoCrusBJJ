"""Validate final Castle Hill AY09 dedicated URL parameters evidence."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE_DIR = ROOT / "assets/meta/castle-hill/youth-wave-2/comparisons/reconciliation-2026-09-08"
FINAL = EVIDENCE_DIR / "url-parameters-final.json"
EXPECTED_URL = "https://joaocrusbjj.com/castle-hill-grand-opening/"
EXPECTED_TAGS = (
    "utm_source=meta&utm_medium=paid_social&"
    "utm_campaign=austin_castle_hill_launch_v1&"
    "utm_content={{ad.name}}&utm_term={{adset.name}}&utm_id={{campaign.id}}"
)
EXPECTED = {
    "120251263002380072": "1567708678432946",
    "120251263139970072": "1571675311324124",
    "120251261045730072": "1571675311324124",
}


def main() -> None:
    evidence = json.loads(FINAL.read_text())
    assert evidence["destination_url"] == EXPECTED_URL
    assert evidence["url_tags"] == EXPECTED_TAGS
    assert evidence["campaign"]["status"] == evidence["campaign"]["effective_status"] == "PAUSED"
    assert evidence["adset"]["status"] == evidence["adset"]["effective_status"] == "PAUSED"
    assert evidence["campaign"]["daily_budget"] == "1000"
    assert evidence["adset"]["location"] == "Austin, Texas"
    assert evidence["adset"]["radius_miles"] == 10
    assert (evidence["adset"]["age_min"], evidence["adset"]["age_max"]) == (24, 54)

    ads = evidence["ads"]
    assert len(ads) == len({ad["id"] for ad in ads}) == 3
    assert {ad["id"]: ad["creative_id"] for ad in ads} == EXPECTED
    for ad in ads:
        assert ad["status"] == ad["effective_status"] == "PAUSED"
        assert ad["website_url_clean"] and ad["url_tags_exact"]
        assert ad["ui_url_parameters_visible"]

    all_ads = evidence["all_campaign_ads"]
    assert all_ads == {
        "count": 11,
        "all_configured_paused": True,
        "all_effective_paused": True,
    }
    video = evidence["video_preservation"]
    assert video["duration_seconds"] == 26.866
    assert video["feed_dimensions"] == "720x900"
    assert video["vertical_dimensions"] == "720x1280"
    assert video["preferred_thumbnails_rgb_identical"]
    assert video["approved_source_reused_for_meta_clone"]

    for filename in evidence["ui_evidence"]:
        assert (EVIDENCE_DIR / filename).is_file(), filename
    assert evidence["publish_state"]["pending_draft"] is False
    assert evidence["publish_state"]["publish_button_disabled"] is True
    print("PASS: all three AY09 ads have clean URLs and exact dedicated URL parameters")
    print("PASS: campaign, ad set, and all 11 ads are PAUSED / PAUSED")
    print("PASS: final media mappings and authenticated Ads Manager evidence recorded")


if __name__ == "__main__":
    main()
