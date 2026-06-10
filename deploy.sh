#!/usr/bin/env bash
set -e

BUCKET="gs://douglas-25lat-prod"

echo "→ Synchronizuję pliki z $BUCKET..."
gcloud storage rsync -r . "$BUCKET" \
  --delete-unmatched-destination-objects \
  --exclude="node_modules/.*|screenshots/.*|shot\.cjs|package.*\.json|README\.md|\.git/.*|\.github/.*|\.claude/.*|deploy\.sh"

echo "→ Ustawiam no-cache na plikach HTML/CSS/JS..."
for f in \
  index.html \
  css/style.css \
  js/events-data.js \
  js/timeline.js \
  js/map.js \
  js/filters.js \
  js/countdown.js \
  js/products.js \
  js/faq.js \
  js/contest.js; do
  gcloud storage objects update "$BUCKET/$f" --cache-control="no-cache, max-age=0" 2>/dev/null && echo "  ✓ $f"
done

echo ""
echo "✓ Deploy zakończony! Odśwież: https://storage.googleapis.com/douglas-25lat-prod/index.html"
