#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${1:-dist/dola-downloader-extension.zip}"

if [[ "${OUTPUT_PATH}" != /* ]]; then
  OUTPUT_PATH="${ROOT_DIR}/${OUTPUT_PATH}"
fi

mkdir -p "$(dirname "${OUTPUT_PATH}")"
rm -f "${OUTPUT_PATH}"

node "${ROOT_DIR}/scripts/validate-extension.mjs"

cd "${ROOT_DIR}"
zip -q "${OUTPUT_PATH}" \
  manifest.json \
  background.js \
  content.js \
  content.css \
  page-interceptor.js \
  popup.html \
  popup.js \
  popup.css \
  icon16.png \
  icon48.png \
  icon128.png \
  icon.jpg

printf 'Created %s\n' "${OUTPUT_PATH}"
