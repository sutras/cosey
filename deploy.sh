#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ -f .env.local ]]; then
  set -a
  source ./.env.local
  set +a
fi

TARGET="${1:-all}"

require_var() {
  local name=$1
  if [[ -z "${!name:-}" ]]; then
    echo "❌ 缺少环境变量 $name" >&2
    echo "   请在项目根目录创建 .env.local，内容形如：" >&2
    exit 1
  fi
}

deploy_site() {
  local name=$1
  local src=$2
  local dest=$3

  echo "▶ 部署${name}（rsync -> ${dest}）..."
  rsync -avzhc --mkpath --partial --stats --delete --exclude='.user.ini' \
    "$src" "$dest"
  echo "✓ ${name}部署完成"
}

deploy_demo() {
  require_var DEPLOY_TARGET_DEMO

  echo "▶ 构建案例（npm run build）..."
  npm run build

  deploy_site 案例 dist/ "$DEPLOY_TARGET_DEMO"
}

deploy_docs() {
  require_var DEPLOY_TARGET_DOCS

  echo "▶ 构建文档（npm run docs:build）..."
  npm run docs:build

  deploy_site 文档 docs/.vitepress/dist/ "$DEPLOY_TARGET_DOCS"
}

case "$TARGET" in
  all)
    deploy_demo
    deploy_docs
    ;;
  demo)
    deploy_demo
    ;;
  docs)
    deploy_docs
    ;;
  *)
    echo "用法: bash deploy.sh [demo|docs|all]" >&2
    exit 1
    ;;
esac

echo "✓ 部署完成"
