#!/bin/bash
# build-all.sh — regenerates the whole site, in the order the generators need:
# practice page, course pages, practice blocks, sources, meta tags, French twins, search index, offline list.
#   PLAYWRIGHT=/path/to/playwright-core/index.mjs CHROME=/path/to/chromium bash tools/build-all.sh
set -e
cd "$(dirname "$0")/.."
node tools/build-practice.mjs | tail -1
node tools/build.mjs | grep -i "conflict\|error\|untranslated: [1-9]" || true
node tools/add-practice.mjs | tail -1
node tools/add-sources.mjs | tail -1
node tools/add-meta.mjs | tail -1
node tools/build-fr.mjs | tail -1
node tools/add-meta.mjs | tail -1
node tools/build-search.mjs | tail -3
node tools/build-offline.mjs | tail -1
