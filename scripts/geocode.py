"""
Geocode user-supplied property records with Nominatim.

Input defaults to data/properties.input.json, which is ignored by Git.
Output defaults to public/data/properties.json, which is served by the app.

Usage:
  NOMINATIM_CONTACT="you@example.com" python scripts/geocode.py
  python scripts/geocode.py private/input.json public/data/properties.json
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
INPUT_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "properties.input.json"
OUTPUT_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "public" / "data" / "properties.json"
CONTACT = os.environ.get("NOMINATIM_CONTACT", "").strip()


def load_properties(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as source:
        payload = json.load(source)

    properties = payload.get("properties") if isinstance(payload, dict) else payload
    if not isinstance(properties, list):
        raise ValueError("Input must be an array or an object containing a properties array")

    return properties


def geocode(address: str, city: str, state: str, zip_code: str):
    query = f"{address}, {city}, {state} {zip_code}".strip()
    params = urllib.parse.urlencode({"q": query, "format": "json", "limit": "1"})
    request = urllib.request.Request(
        f"https://nominatim.openstreetmap.org/search?{params}",
        headers={"User-Agent": f"property-map-template/1.0 ({CONTACT})"},
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        results = json.loads(response.read())

    if not results:
        return None, None

    return float(results[0]["lat"]), float(results[0]["lon"])


def main():
    if not CONTACT:
        raise SystemExit("Set NOMINATIM_CONTACT to a valid email address before geocoding")
    if not INPUT_PATH.exists():
        raise SystemExit(f"Input file not found: {INPUT_PATH}")

    properties = load_properties(INPUT_PATH)
    results = []

    for index, source in enumerate(properties):
        prop = dict(source)
        label = ", ".join(
            str(prop.get(field, "")).strip()
            for field in ("address", "city", "state", "zip")
            if str(prop.get(field, "")).strip()
        )
        print(f"[{index + 1}/{len(properties)}] {label}")

        try:
            prop["lat"], prop["lng"] = geocode(
                str(prop.get("address", "")),
                str(prop.get("city", "")),
                str(prop.get("state", "")),
                str(prop.get("zip", "")),
            )
        except Exception as error:
            print(f"  ERROR: {error}")
            prop["lat"], prop["lng"] = None, None

        results.append(prop)
        if index < len(properties) - 1:
            time.sleep(1.1)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as output:
        json.dump(
            {
                "synced_at": datetime.now(timezone.utc).isoformat(),
                "properties": results,
            },
            output,
            indent=2,
        )
        output.write("\n")

    geocoded = sum(prop["lat"] is not None for prop in results)
    print(f"Done: {geocoded}/{len(results)} geocoded -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
