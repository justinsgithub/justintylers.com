#!/usr/bin/env bash
# Sync articles and social drafts from Convex production to local content/ directory
# Usage: ./scripts/sync-content.sh [articles|drafts|all]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONTENT_DIR="$PROJECT_DIR/content"
API_BASE="https://earnest-woodpecker-507.convex.site/tyler"

# Load API key
if [[ -f "$HOME/.claude/.env" ]]; then
  source "$HOME/.claude/.env"
fi

if [[ -z "${TYLER_API_KEY:-}" ]]; then
  echo "Error: TYLER_API_KEY not set. Check ~/.claude/.env"
  exit 1
fi

CURL_OPTS=(-s -H "X-Tyler-Key: $TYLER_API_KEY")

sync_articles() {
  echo "Syncing articles..."
  local articles_dir="$CONTENT_DIR/articles"
  mkdir -p "$articles_dir"

  local response
  response=$(curl "${CURL_OPTS[@]}" "$API_BASE/articles?draft=true")

  local success
  success=$(echo "$response" | jq -r '.success // false')
  if [[ "$success" != "true" ]]; then
    echo "Error fetching articles: $response"
    return 1
  fi

  local count
  count=$(echo "$response" | jq '.data | length')
  echo "  Found $count articles"

  # Save master JSON
  echo "$response" | jq '.data' > "$articles_dir/articles.json"

  # Save individual markdown files
  echo "$response" | jq -c '.data[]' | while read -r article; do
    local slug title description category tags published_at featured draft image reading_time content_md

    slug=$(echo "$article" | jq -r '.slug')
    title=$(echo "$article" | jq -r '.title // ""')
    description=$(echo "$article" | jq -r '.description // ""')
    category=$(echo "$article" | jq -r '.category // ""')
    tags=$(echo "$article" | jq -r '(.tags // []) | join(", ")')
    published_at=$(echo "$article" | jq -r '.publishedAt // ""')
    featured=$(echo "$article" | jq -r '.featured // false')
    draft=$(echo "$article" | jq -r '.draft // false')
    image=$(echo "$article" | jq -r '.image // ""')
    reading_time=$(echo "$article" | jq -r '.readingTime // ""')
    content_md=$(echo "$article" | jq -r '.contentMarkdown // .content // ""')

    local file="$articles_dir/${slug}.md"
    cat > "$file" << FRONTMATTER
---
title: "${title}"
description: "${description}"
category: "${category}"
tags: [${tags}]
publishedAt: "${published_at}"
featured: ${featured}
draft: ${draft}
image: "${image}"
readingTime: "${reading_time}"
---

${content_md}
FRONTMATTER

    echo "  -> $slug.md"
  done

  echo "  Articles synced to $articles_dir"
}

sync_drafts() {
  echo "Syncing social drafts..."
  local drafts_dir="$CONTENT_DIR/social-drafts"
  mkdir -p "$drafts_dir"

  local response
  response=$(curl "${CURL_OPTS[@]}" "$API_BASE/social-drafts")

  local success
  success=$(echo "$response" | jq -r '.success // false')
  if [[ "$success" != "true" ]]; then
    echo "Error fetching social drafts: $response"
    return 1
  fi

  local count
  count=$(echo "$response" | jq '.data | length')
  echo "  Found $count drafts"

  # Save master JSON
  echo "$response" | jq '.data' > "$drafts_dir/social-drafts.json"

  # Clean existing status/platform dirs (rebuild fresh)
  for status_dir in "$drafts_dir"/*/; do
    [[ -d "$status_dir" ]] && rm -rf "$status_dir"
  done

  # Save individual markdown files organized by status/platform
  echo "$response" | jq -c '.data[]' | while read -r draft; do
    local id title platform content status group_id hashtags article_slug notes photo_needed

    id=$(echo "$draft" | jq -r '._id')
    title=$(echo "$draft" | jq -r '.title // "untitled"')
    platform=$(echo "$draft" | jq -r '.platform // "unknown"')
    content=$(echo "$draft" | jq -r '.content // ""')
    status=$(echo "$draft" | jq -r '.status // "draft"')
    group_id=$(echo "$draft" | jq -r '.groupId // ""')
    hashtags=$(echo "$draft" | jq -r '(.hashtags // []) | join(" ")')
    article_slug=$(echo "$draft" | jq -r '.articleSlug // ""')
    article_url=$(echo "$draft" | jq -r '.articleUrl // ""')
    article_title=$(echo "$draft" | jq -r '.articleTitle // ""')
    notes=$(echo "$draft" | jq -r '.notes // ""')
    photo_needed=$(echo "$draft" | jq -r '.photoNeeded // ""')
    scheduled_date=$(echo "$draft" | jq -r '.scheduledDate // ""')
    scheduled_time=$(echo "$draft" | jq -r '.scheduledTime // ""')

    local dir="$drafts_dir/$status/$platform"
    mkdir -p "$dir"

    # Slugify title for filename
    local filename
    filename=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
    [[ -z "$filename" ]] && filename="$id"

    local file="$dir/${filename}.md"
    {
      echo "---"
      echo "id: \"$id\""
      echo "title: \"$title\""
      echo "platform: $platform"
      echo "status: $status"
      echo "groupId: \"$group_id\""
      [[ -n "$article_slug" ]] && echo "articleSlug: \"$article_slug\""
      [[ -n "$article_url" ]] && echo "articleUrl: \"$article_url\""
      [[ -n "$article_title" ]] && echo "articleTitle: \"$article_title\""
      [[ -n "$hashtags" ]] && echo "hashtags: \"$hashtags\""
      [[ -n "$photo_needed" ]] && echo "photoNeeded: \"$photo_needed\""
      [[ -n "$notes" ]] && echo "notes: \"$notes\""
      [[ -n "$scheduled_date" ]] && echo "scheduledDate: \"$scheduled_date\""
      [[ -n "$scheduled_time" ]] && echo "scheduledTime: \"$scheduled_time\""
      echo "---"
      echo ""
      echo "$content"
      if [[ -n "$hashtags" ]]; then
        echo ""
        echo "$hashtags"
      fi
    } > "$file"

    echo "  -> $status/$platform/${filename}.md"
  done

  echo "  Drafts synced to $drafts_dir"
}

# Summary of what's on disk
print_summary() {
  echo ""
  echo "=== Content Summary ==="
  if [[ -d "$CONTENT_DIR/articles" ]]; then
    local article_count
    article_count=$(find "$CONTENT_DIR/articles" -name "*.md" | wc -l)
    echo "  Articles: $article_count files"
  fi
  if [[ -d "$CONTENT_DIR/social-drafts" ]]; then
    for status_dir in "$CONTENT_DIR/social-drafts"/*/; do
      [[ -d "$status_dir" ]] || continue
      local status_name
      status_name=$(basename "$status_dir")
      local draft_count
      draft_count=$(find "$status_dir" -name "*.md" | wc -l)
      echo "  Drafts ($status_name): $draft_count files"
    done
  fi
}

# Main
target="${1:-all}"

case "$target" in
  articles)
    sync_articles
    ;;
  drafts)
    sync_drafts
    ;;
  all)
    sync_articles
    echo ""
    sync_drafts
    ;;
  *)
    echo "Usage: $0 [articles|drafts|all]"
    exit 1
    ;;
esac

print_summary
