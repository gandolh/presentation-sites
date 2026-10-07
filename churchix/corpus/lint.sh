#!/usr/bin/env bash
# Corpus health check. Exits non-zero on failure so it can gate a commit.
#
#   bash corpus/lint.sh            check
#   bash corpus/lint.sh --index    regenerate index.md's catalog block, then check
#
# Checks: every wiki page has summary: + updated: frontmatter; every relative
# link resolves; no page exceeds MAX_LINES body lines; no page references a
# path churchix has abandoned; every brief sits in exactly one of
# todo/done/superseded, and a done or superseded brief carries its closing note.

set -uo pipefail

CORPUS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$CORPUS")"
MAX_LINES=200
FAIL=0

say()  { printf '%s\n' "$*"; }
bad()  { printf '  ✗ %s\n' "$*"; FAIL=1; }

# --- frontmatter helpers -----------------------------------------------------
# Print the value of a frontmatter key, or nothing when absent/not a block.
fm() { # fm <file> <key>
  awk -v key="$2" '
    NR==1 { if ($0 != "---") exit; next }
    /^---[[:space:]]*$/ { exit }
    index($0, key ": ") == 1 { print substr($0, length(key) + 3); exit }
  ' "$1"
}

# Body line count (frontmatter excluded).
body_lines() {
  awk '
    NR==1 && $0=="---" { infm=1; next }
    infm && /^---[[:space:]]*$/ { infm=0; next }
    !infm { n++ }
    END { print n+0 }
  ' "$1"
}

# --- 1. wiki frontmatter -----------------------------------------------------
say "Frontmatter"
shopt -s nullglob
WIKI_PAGES=("$CORPUS"/wiki/*.md)
if [ ${#WIKI_PAGES[@]} -eq 0 ]; then
  bad "corpus/wiki/ has no pages"
fi
for f in "${WIKI_PAGES[@]}"; do
  rel="${f#"$ROOT"/}"
  [ -n "$(fm "$f" summary)" ] || bad "$rel: missing 'summary:' frontmatter"
  u="$(fm "$f" updated)"
  if [ -z "$u" ]; then
    bad "$rel: missing 'updated:' frontmatter"
  elif ! printf '%s' "$u" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
    bad "$rel: 'updated: $u' is not an absolute YYYY-MM-DD date"
  fi
done

# --- 2. page size ------------------------------------------------------------
say "Page size (max $MAX_LINES body lines)"
for f in "${WIKI_PAGES[@]}"; do
  n="$(body_lines "$f")"
  [ "$n" -le "$MAX_LINES" ] || bad "${f#"$ROOT"/}: $n body lines — split it"
done

# --- 3. relative links resolve ----------------------------------------------
say "Relative links"
ALL_MD=("$CORPUS"/*.md "$CORPUS"/wiki/*.md "$CORPUS"/todos/*.md \
        "$CORPUS"/briefs/todo/*.md "$CORPUS"/briefs/done/*.md \
        "$CORPUS"/briefs/superseded/*.md)
for f in "${ALL_MD[@]}"; do
  [ -f "$f" ] || continue
  dir="$(dirname "$f")"
  # Markdown inline links only; skip http(s), mailto and pure anchors.
  while read -r target; do
    case "$target" in http://*|https://*|mailto:*|'#'*|'') continue ;; esac
    path="${target%%#*}"
    [ -n "$path" ] || continue
    [ -e "$dir/$path" ] || bad "${f#"$ROOT"/}: dead link -> $target"
  done < <(grep -oE '\]\([^)]+\)' "$f" | sed -E 's/^\]\(//; s/\)$//')
done

# --- 4. abandoned paths ------------------------------------------------------
# A page that describes a path churchix no longer has is stale. Link targets are
# covered by check 3; this catches *prose* claims. A mention is allowed when the
# line marks it as history ("moved", "removed", "no longer" ...). log.md and the
# briefs are history by definition and are skipped: briefs are immutable.
say "Abandoned paths"
ABANDONED=(docs/wiki docs/todo docs/corpus apps/parohia-berinta-maramures)
HISTORY_RE='move out|moved|removed|no longer|used to|left the repo|was in|deleted|pruned|written in'
for stale in "${ABANDONED[@]}"; do
  [ -d "$ROOT/$stale" ] && continue
  while IFS=: read -r file line text; do
    [ -n "${file:-}" ] || continue
    printf '%s' "$text" | grep -Eqi "$HISTORY_RE" && continue
    bad "${file#"$ROOT"/}:$line references '$stale/', which no longer exists"
  done < <(grep -rn --include='*.md' -E "(^|[^A-Za-z0-9_/.-])$stale/" "$CORPUS" 2>/dev/null \
           | grep -v "^$CORPUS/log.md:" | grep -v "^$CORPUS/briefs/" || true)
done

# --- 5. brief placement ------------------------------------------------------
# Each brief number lives in exactly one of todo/done/superseded. A done brief
# carries "## Outcome (...)" and a superseded one "## Superseded (...)".
say "Briefs"
declare -A SEEN=()
for state in todo done superseded; do
  for f in "$CORPUS"/briefs/"$state"/*.md; do
    name="$(basename "$f")"
    rel="${f#"$ROOT"/}"
    if ! printf '%s' "$name" | grep -Eq '^[0-9]{2,}-[a-z0-9-]+\.md$'; then
      bad "$rel: brief names are NN-slug.md"
      continue
    fi
    num="${name%%-*}"
    if [ -n "${SEEN[$num]:-}" ]; then
      bad "$rel: brief $num is also in ${SEEN[$num]}"
    else
      SEEN[$num]="briefs/$state/"
    fi
    case "$state" in
      done)       grep -q '^## Outcome' "$f"    || bad "$rel: done brief has no '## Outcome' note" ;;
      superseded) grep -q '^## Superseded' "$f" || bad "$rel: superseded brief has no '## Superseded' note" ;;
    esac
  done
done

# --- 6. index catalog --------------------------------------------------------
regen_index() {
  local tmp; tmp="$(mktemp)"
  {
    echo '<!-- CATALOG:START — generated by lint.sh --index; do not hand-edit -->'
    for f in "$CORPUS"/wiki/*.md; do
      [ -f "$f" ] || continue
      printf -- '- [%s](wiki/%s) — %s\n' \
        "$(basename "$f" .md)" "$(basename "$f")" "$(fm "$f" summary)"
    done
    echo '<!-- CATALOG:END -->'
  } > "$tmp"
  awk -v cat="$tmp" '
    /^<!-- CATALOG:START/ { while ((getline line < cat) > 0) print line; skip=1; next }
    /^<!-- CATALOG:END/   { skip=0; next }
    !skip
  ' "$CORPUS/index.md" > "$CORPUS/index.md.new" && mv "$CORPUS/index.md.new" "$CORPUS/index.md"
  rm -f "$tmp"
  say "Regenerated corpus/index.md catalog."
}

if [ "${1:-}" = "--index" ]; then
  regen_index
fi

say "Index catalog"
for f in "${WIKI_PAGES[@]}"; do
  grep -q "wiki/$(basename "$f")" "$CORPUS/index.md" \
    || bad "${f#"$ROOT"/}: orphan — not in index.md (run: bash corpus/lint.sh --index)"
done

# --- verdict -----------------------------------------------------------------
if [ "$FAIL" -eq 0 ]; then
  say "OK — corpus is clean."
else
  say "FAILED — fix the findings above."
fi
exit "$FAIL"
