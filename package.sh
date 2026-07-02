#!/usr/bin/env bash
# Pakuje gotową stronę do pliku ZIP, który klient może samodzielnie wgrać na swój serwer.
set -e

OUT="25lat-$(date +%Y%m%d-%H%M).zip"

echo "→ Pakuję pliki strony do $OUT..."
zip -r "$OUT" . \
  -x "node_modules/*" \
  -x "package.json" -x "package-lock.json" \
  -x "README.md" \
  -x ".git/*" -x ".github/*" -x ".claude/*" -x ".gitignore" \
  -x "deploy.sh" -x "package.sh" \
  -x "AboutFace/*" -x "KAKTUS/*" \
  -x "new/*" \
  -x "screenshots/*" -x "shot.cjs" -x "*.env" \
  -x "25lat-*.zip" \
  > /dev/null

echo "✓ Gotowe: $OUT"
