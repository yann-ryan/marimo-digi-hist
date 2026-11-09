#!/bin/sh
# Export every lab to the GitHub Pages folder (docs/) and add the landing page.
# Run from anywhere: ./build_site.sh
set -e
cd "$(dirname "$0")"
rm -rf docs
mkdir -p docs
.venv/bin/marimo export html-wasm lab.py -o docs/old-bailey --mode edit
.venv/bin/marimo export html-wasm royal-society/lab.py -o docs/royal-society --mode edit
.venv/bin/marimo export html-wasm dutch-parliament/lab.py -o docs/dutch-parliament --mode edit
cp site/index.html docs/index.html
touch docs/.nojekyll
echo "Built docs/: $(ls docs | tr '\n' ' ')"
