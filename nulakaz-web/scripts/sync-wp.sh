#!/usr/bin/env bash
# Pulls latest content from nulakaz.com public WP REST API into ./content/*.json.
# Safe to re-run any time — overwrites the JSON cache used by the static build.
#
# Usage:  bash scripts/sync-wp.sh
#
# Requires: curl + node (for the count summary).

set -euo pipefail

BASE="${NULAKAZ_WP_BASE:-https://nulakaz.com/wp-json}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/content"

echo "Sync target: $BASE"
echo "Writing to:  $OUT"
mkdir -p "$OUT"

curl -fsSL "$BASE/wc/store/v1/products?per_page=100"                                          -o "$OUT/products.json"
curl -fsSL "$BASE/wc/store/v1/products/categories?per_page=100"                               -o "$OUT/categories.json"
curl -fsSL "$BASE/wp/v2/pages?per_page=100&_fields=id,slug,title,content,excerpt,link,template,parent,menu_order" -o "$OUT/pages.json"
curl -fsSL "$BASE/wp/v2/posts?per_page=100&_fields=id,slug,date,modified,title,excerpt,content,link,featured_media,categories,tags" -o "$OUT/posts.json"
curl -fsSL "$BASE/wp/v2/media?per_page=100&_fields=id,slug,title,source_url,alt_text,media_details"                -o "$OUT/media.json"

cd "$OUT"
echo "--- sizes ---"
wc -c ./*.json
echo "--- counts ---"
node -e 'for (const f of ["products","categories","pages","posts","media"]) { const d = require("fs").readFileSync(`${f}.json`); try { console.log(f.padEnd(12), JSON.parse(d).length); } catch { console.log(f, "invalid json"); } }'
echo "Done."
